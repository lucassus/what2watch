#!/usr/bin/env node

var _ = require('lodash');
var Q = require('q');
var ProgressBar = require('progress');

var program = require('./lib/program');

if (!program.directory) {
  console.error('Directory not given!');
  program.help();

  process.exit(1);
}

var OpenSubtitles = require('./lib/openSubtitles');
var api = new OpenSubtitles();

var findMovies = require('./lib/findMovies');
var collectFileStats = require('./lib/collectFileStats');
var collectInfo = require('./lib/collectInfo');
var collectDetails = require('./lib/collectDetails');

var buildProgressBar = function(format, total) {
  var bar = new ProgressBar(format, { total: total });
  return {
    tick: function() { bar.tick() }
  }
};

Q(program.directory).then(function(directory) {
  return findMovies(program.formats, directory);
}).then(function(files) {
  console.log('Found', files.length, 'movies');
  var bar = buildProgressBar('Loading files                 [:bar] :percent :etas', files.length);
  return collectFileStats(files).progress(bar.tick);
}).then(function(stats) {
  var bar = buildProgressBar('Trying to find movies         [:bar] :percent :etas', stats.length);
  return collectInfo(api, stats).progress(bar.tick);
}).then(function(stats) {
  var bar = buildProgressBar('Trying to fetch movie details [:bar] :percent :etas', stats.length);
  return collectDetails(api, stats).progress(bar.tick);
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
