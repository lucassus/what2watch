require('colors');
var _ = require('lodash');

module.exports = function(stat) {
  console.log('\n----------------------------\n');

  console.log(stat.movie.title.bold.blue);
  console.log(stat.movie.plot.italic.grey);
  console.log();

  console.log(
    'Rating:'.yellow, stat.movie.rating.cyan,
    'Year:'.yellow, stat.movie.year.cyan,
    'Duration:'.yellow, stat.movie.duration.cyan
  );

  if (stat.movie.genres) {
    console.log('Genre:'.yellow, _.map(stat.movie.genres, function(genre) { return genre.trim().blue }).join(', '));
  }

  if (stat.movie.directors) {
    console.log('Directors:'.yellow, _.values(stat.movie.directors).join(', '));
  }

  if (stat.movie.cast) {
    console.log('Cast:'.yellow, _.values(stat.movie.cast).slice(0, 7).join(', '));
  }

  if (stat.movie.country && stat.movie.language) {
    console.log(
      'Country:'.yellow, stat.movie.country.join(', '),
      'Language:'.yellow, stat.movie.language.join(', ')
    );
  }

  if (stat.movie.imdbId) {
    console.log('Url:'.yellow, 'http://www.imdb.com/title/tt0' + stat.movie.imdbId);
  }

  console.log('File:'.yellow, stat.file.path);
};
