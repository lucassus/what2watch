var expect = require('chai').expect;
var helper = require('../spec_helpers');

var findMovies = require('./find_movies');

describe('.findMovies', function() {

  it('can find `avi` files', function() {
    return findMovies(['avi'], helper.fixturePath('movies')).then(function(files) {
      expect(files).to.have.length(2);
      expect(files[0]).to.match(new RegExp('movie/movie.avi$'));
      expect(files[1]).to.match(new RegExp('one.avi$'));
    });
  });

  it('can find `mkv` files', function() {
    return findMovies(['mkv'], helper.fixturePath('movies')).then(function(files) {
      expect(files).to.have.length(1);
      expect(files[0]).to.match(new RegExp('two.mkv$'));
    });
  });

  it('can find files with the given extensions', function() {
    return findMovies(['avi', 'mkv'], helper.fixturePath('movies')).then(function(files) {
      expect(files).to.have.length(3);
      expect(files[0]).to.match(new RegExp('movie/movie.avi$'));
      expect(files[1]).to.match(new RegExp('one.avi$'));
      expect(files[2]).to.match(new RegExp('two.mkv$'));
    });
  });

  describe('when the given directory does not contain movies', function() {

    it('rejects with an error', function() {
      return findMovies(['mpg'], helper.fixturePath('movies')).catch(function(error) {
        expect(error).to.eq('No movies found!');
      });
    });

  });

});
