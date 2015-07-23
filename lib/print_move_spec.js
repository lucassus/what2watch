var chalk = require('chalk');
var expect = require('chai').expect;

var printMovie = require('./print_movie');

describe('.printMovie', function() {

  var stat = {
    movie: {
      imdbId: '0121766',
      title: 'Star Wars',

      rating: '7.7',
      plot: 'As the Clone Wars near an end, the Sith Lord Darth Sidious steps out of the shadows...',
      year: '2005',
      duration: '120 min',
      genres: ['Fantasy', 'Sci-Fi'],
      directors: ['George Lucas'],
      cast: ['Ewan McGregor', 'Natalie Portman'],
      country: ['USA'],
      language: ['English']
    },
    file: {
      path: '/Downloads/Star Wars.avi'
    }
  };

  it('prints a movie', function() {
    var result = printMovie(stat);

    expect(result).to.include('Star Wars');
    expect(result).to.include('Year: ' + chalk.cyan('2005'));
    expect(result).to.include('Duration: ' + chalk.cyan('120 min'));
    expect(result).to.include('Genres: ' + chalk.cyan('Fantasy') + ', ' + chalk.cyan('Sci-Fi'));
    expect(result).to.include('Country: ' + chalk.cyan('USA'));
    expect(result).to.include(chalk.cyan('http://www.imdb.com/title/tt00121766'));
  });

});
