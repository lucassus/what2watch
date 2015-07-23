var _ = require('lodash');
var fs = require('fs');
var chalk = require('chalk');
var path = require('path');

var tpl = fs.readFileSync(path.resolve(__dirname, 'print_movie.tpl.txt'));
var compiled = _.template(tpl.toString().trim());

function formatCollection(collection) {
  return collection.map(function(item) {
    return chalk.cyan(item.trim());
  }).join(', ');
}

module.exports = function(stat) {
  return compiled({
    title: chalk.bold.blue(_.get(stat, 'movie.title', '')),
    plot: chalk.italic.grey(_.get(stat, 'movie.plot', '')),

    rating: chalk.cyan(_.get(stat, 'movie.rating', '')),
    year: chalk.cyan(_.get(stat, 'movie.year', '')),
    duration: chalk.cyan(_.get(stat, 'movie.duration', '')),
    genres: formatCollection(_.get(stat, 'movie.genres', [])),

    directors: formatCollection(_.get(stat, 'movie.directors', [])),
    cast: formatCollection(_.get(stat, 'movie.cast', []).slice(0, 7)),

    country: formatCollection(_.get(stat, 'movie.country', [])),
    language: formatCollection(_.get(stat, 'movie.language', [])),

    imdbUrl: chalk.cyan('http://www.imdb.com/title/tt0' + _.get(stat, 'movie.imdbId', '')),
    filePath: chalk.cyan(_.get(stat, 'file.path'))
  });
};
