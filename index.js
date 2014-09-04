#!/usr/bin/env node

var program = require('commander');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var hasher = require('./lib/hasher');
var request = require('request');
var cheerio = require('cheerio');

var list = function(val) {
  return _(val.split(',')).map(function(format) {
    return format.trim();
  });
};

program
  .version('0.0.1')
  .option('-f, --formats [formats]', 'list of movie formats to process, default avi,mkv,mpg', list)
  .option('-d, --directory [directory]', 'working directory')
  .parse(process.argv);

if (!program.formats) {
  program.formats = ['avi', 'mkv', 'mp4', 'mpg'];
}

var promisify = require('./lib/promisify');

var listMovies = function(cwd) {
  var pattern = '**/*.+(' + program.formats.join('|') +  ')';
  return promisify(glob)(pattern, { cwd: cwd, dot: false });
};

var fileHash = function(filePath) {
  return Q.promise(function(resolve) {
    hasher.getHash(filePath).done(function(hash) {
      resolve(hash);
    });
  });
};

var collectFileStats = function(files) {
  var completed = 0;

  var promise = Q.all(
    _.map(files, function(file) {
      var filePath = path.join(program.directory, file);

      return Q.promise(function(resolve, reject, progress) {
        fs.stat(filePath, function(err, stats) {
          progress({ total: files.length, complete: ++completed });

          if (err) { return reject(err); }

          resolve({
            filePath: filePath,
            size: stats.size,
            downloadedAt: stats.ctime
          });
        });
      });
    })
  );

  return promise.then(function(stats) {
    return Q.all(
      _.map(stats, function(stat) {
        return fileHash(stat.filePath).then(function(hash) {
          return _.extend(stat, { hash: hash });
        });
      })
    )
  });
};

var OpenSubtitles = require('./lib/openSubtitles');
var api = new OpenSubtitles();

var collectOpenSubtitles = function(stats) {
  return api.login().then(function(token) {
    var promise = Q.allSettled(
      _.map(stats, function(stat) {
        return Q.promise(function(resolve, reject, progress) {
          api.checkMovieHash(stat).then(function(data) {
            progress({ total: stats.length });
            resolve(data);
          }).catch(function(err) {
            progress({ total: stats.length });
            reject(err);
          }).done();
        });
      })
    );

    return promise.then(function(results) {
      results = _.chain(results)
        .select({ state: 'fulfilled' })
        .collect(function(result) { return result.value })
        .value();

      _.each(results, function(result) {
        var getParam = function(name) {
          var param = _.find(result, { name: name });
          return param.value.string;
        };

        var stat = _.find(stats, { hash: getParam('MovieHash') });
        if (stat) {
          var openSubtitles = {
            title: getParam('MovieName'),
            imdbId: getParam('MovieImdbID'),
            year: getParam('MovieYear'),
            kind: getParam('MovieKind'),
            seriesSeason: getParam('SeriesSeason'),
            seriesEpisode: getParam('SeriesEpisode'),
            seenCount: getParam('SeenCount')
          };

          _.extend(stat, { openSubtitles: openSubtitles });
        }
      });

      return stats;
    });
  });
};

var collectImdb = function(stats) {
  var statsWithId = _.select(stats, function(stat) { return stat.openSubtitles });

  var promise = Q.allSettled(
    _.map(statsWithId, function(stat) {

      return Q.promise(function(resolve, reject, progress) {

        var url = 'http://www.imdb.com/title/tt0' + stat.openSubtitles.imdbId;
        request.get(url, function(err, response, body) {
          progress();
          if (err) { return reject(err); }

          var $ = cheerio.load(body);
          var details = {
            id: stat.openSubtitles.imdbId,
            url: url,
            title: $('h1 span.itemprop[itemprop="name"]').text().trim(),

            // TODO not always present
            titleExtra: $('h1 span.title-extra[itemprop="name"]').text().trim(),

            duration: $('.infobar time[itemprop="duration"]').text().trim(),
            genre: _.collect($('.infobar a span[itemprop="genre"]'), function(el) {
              return $(el).text().trim();
            }),
            rating: parseFloat($('span[itemprop="ratingValue"]').text().trim()),
            // TODO scrap rating count
            description: $('p[itemprop="description"]').text().trim()

            // TODO scrap reviews count
            // TODO scrap critic reviews count
            // TODO scrap creators / director
            // TODO scrap stars
            // TODO parse awards
            // TODO scrap country
          };

          resolve(details);
        });
      });
    })
  );

  return promise.then(function(results) {
    results = _.chain(results)
      .select({ state: 'fulfilled' })
      .collect(function(result) { return result.value })
      .value();

    _.each(results, function(result) {
      var stat = _.find(stats, function(stat) { return stat.openSubtitles && stat.openSubtitles.imdbId === result.id });
      if (stat) {
        _.extend(stat, { imdb: result });
      }
    });

    return stats;
  });
};

var ProgressBar = require('progress');

Q(program.directory).then(function(directory) {
  return listMovies(directory);
}).then(function(files) {
  console.log('Found', files.length, 'files');

  var bar = new ProgressBar('Collecting file stats         [:bar] :percent :etas', { total: files.length });
  return collectFileStats(files).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  var bar = new ProgressBar('Collecting OpenSubtitles data [:bar] :percent :etas', { total: stats.length });
  return collectOpenSubtitles(stats).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  var bar = new ProgressBar('Collecting Imdb data          [:bar] :percent :etas', { total: stats.length });
  return collectImdb(stats).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  // sort movies by year
  return _.chain(stats)
    .sortBy(function(stat) { return stat.imdb && stat.imdb.rating })
    .reverse()
    .value();
}).then(function(stats) {
  console.log('\n\nMovie details --------------\n');

  _.each(stats, function(stat) {
    if (stat.openSubtitles && stat.imdb) {
      console.log('Title:', stat.openSubtitles.title);
      console.log('Description:', stat.imdb.description);
      console.log('Rating', stat.imdb.rating);
      console.log('Genre:', stat.imdb.genre.join(', '));
      console.log('Year:', stat.openSubtitles.year);
      console.log('Url:', stat.imdb.url);
      console.log('File:', stat.filePath);
      console.log('\n----------------------------\n');
    }
  });
}).catch(function(err) {
  console.log('err:', err);
}).done();
