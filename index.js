#!/usr/bin/env node

var program = require('commander');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var hasher = require('./lib/hasher');

var list = function(val) {
  return _(val.split(',')).map(function(format) {
    return format.trim();
  });
};

program
  .version('0.0.1')
  .option('-f, --formats [formats]', 'list of movie formats to process, default avi,mkv,mp4,mpg', list)
  .option('-d, --directory [directory]', 'working directory')
  .parse(process.argv);

if (!program.formats) {
  program.formats = ['avi', 'mkv', 'mp4', 'mpg'];
}

var findMovies = function(directory) {
  var deferred = Q.defer();

  var pattern = '**/*.+(' + program.formats.join('|') +  ')';
  glob(pattern, { cwd: directory, dot: false }, function(err, files) {
    if (err) { return deferred.reject(err); }

    if (files.length > 0) {
      deferred.resolve(files);
    } else {
      deferred.reject('No movies found!');
    }
  });

  return deferred.promise;
};

var fileHash = function(filePath) {
  return Q.promise(function(resolve) {
    hasher.getHash(filePath).done(resolve);
  });
};

var fileStats = function(filePath) {
  return Q.promise(function(resolve, reject) {
    fs.stat(filePath, function(err, stats) {
      if (err) { return reject(err); }

      resolve({
        file: {
          path: filePath,
          size: stats.size,
          downloadedAt: stats.ctime
        }
      });
    });
  }).then(function(stats) {
    return fileHash(stats.file.path).then(function(hash) {
      stats.file.hash = hash;
      return stats;
    });
  });
};

var collectFileStats = function(files) {
  return Q.promise(function(resolve, reject, progress) {
    var promises = _.map(files, function(file) {
      var filePath = path.join(program.directory, file);

      return fileStats(filePath)
        .catch(reject)
        .finally(function() {
          progress({ total: files.length, file: file })
        });
    });

    return Q.all(promises).then(resolve);
  });
};

var OpenSubtitles = require('./lib/openSubtitles');
var api = new OpenSubtitles();

var collectInfo = function(stats) {
  var mapping = { title: 'MovieName', imdbId: 'MovieImdbID', year: 'MovieYear', kind: 'MovieKind' };

  var promise = Q.promise(function(resolve, reject, progress) {
    api.login().then(function() {
      var promises = _.map(stats, function(stat) {
        var promise = api.checkMovieHash(stat.file.hash);

        return promise.then(function(result) {
          var details =_.chain(mapping)
            .pairs()
            .map(function(pair) { return [pair[0], result[pair[1]]] })
            .zipObject()
            .value();

          _.extend(stat, { movie: details });
        }).finally(function() {
          progress({ total: stats.length });
        });
      });

      return Q.allSettled(promises).then(resolve);
    });
  });

  return promise.thenResolve(stats);
};

var collectDetails = function(stats) {
  var promise = Q.promise(function(resolve, reject, progress) {
    api.login().then(function() {
      var promises = _.map(stats, function(stat) {
        var promise = stat.movie && stat.movie.imdbId ?
          api.getIMDBMovieDetails(stat.movie.imdbId) :
          Q.reject('missing');

        return promise.then(function(details) {
          _.extend(stat.movie, details);
        }).finally(function() {
          progress({ total: stats.length });
        });
      });

      return Q.allSettled(promises).then(resolve);
    });
  });

  return promise.thenResolve(stats);
};

var ProgressBar = require('progress');

Q(program.directory).then(function(directory) {
  return findMovies(directory);
}).then(function(files) {
  console.log('Found', files.length, 'movies');

  var bar = new ProgressBar('Collecting file stats            [:bar] :percent :etas', { total: files.length });
  return collectFileStats(files).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  var bar = new ProgressBar('Collecting OpenSubtitles data    [:bar] :percent :etas', { total: stats.length });
  return collectInfo(stats).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  var bar = new ProgressBar('Collecting OpenSubtitles details [:bar] :percent :etas', { total: stats.length });
  return collectDetails(stats).progress(function() {
    bar.tick();
  });
}).then(function(stats) {
  // filter, sort etc.
  return _.chain(stats)
    .select(function(stat) { return stat.movie; } )
    .select(function(stat) { return stat.movie.kind !== 'episode'; })
    .sortBy(function(stat) { return parseFloat(stat.movie.rating) })
    .reverse()
    .value();
}).then(function(stats) {
  console.log('\n\nMovie details --------------\n');

  _.each(stats, function(stat) {
    if (stat.movie) {
      console.log('Title:', stat.movie.title);
      console.log('Kind:', stat.movie.kind);

      console.log('Rating', stat.movie.rating);
      console.log('Plot:', stat.movie.plot);
      console.log('Trivia:', stat.movie.trivia);
      console.log('Tagline:', stat.movie.tagline);

      console.log('Year:', stat.movie.year);
      console.log('Duration:', stat.movie.duration);

      if (stat.movie.genres) {
        console.log('Genre:', _.map(stat.movie.genres, function(genre) { return genre.trim() }).join(', '));
      }

      if (stat.movie.cast) {
        console.log('Cast:', _.values(stat.movie.cast).join(', '));
      }

      if (stat.movie.directors) {
        console.log('Directors:', _.values(stat.movie.directors).join(', '));
      }

      if (stat.movie.country) {
        console.log('Country:', stat.movie.country.join(', '));
      }

      if (stat.movie.language) {
        console.log('Language:', stat.movie.language.join(', '));
      }

      if (stat.movie.imdbId) {
        console.log('Url:', 'http://www.imdb.com/title/tt0' + stat.movie.imdbId);
      }

      console.log('File:', stat.file.path);
      console.log('\n----------------------------\n');
    }
  });
}).catch(function(err) {
  console.log('err:', err);
  process.exit(1);
}).done();
