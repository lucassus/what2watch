var _ = require('lodash');
var nock = require('nock');
var sinon = require('sinon');

var expect = require('chai').expect;
var helper = require('../spec_helpers');

var OpenSubtitles = require('./open_subtitles');
var fetchMovieDetails = require('./fetch_movie_details');

describe('.fetchMovieDetails', function() {

  var api;

  beforeEach(function() {
    api = new OpenSubtitles();
    api.token = 'the token';
  });

  it('fetches movie details', function() {
    nock('http://api.opensubtitles.org').post('/xml-rpc')
      .replyWithFile(200, helper.fixturePath('replies/fetch_movie_details/success.xml'));

    var info = {
      imdbId: '0105665'
    };

    return fetchMovieDetails(api, info).then(function(movie) {
      expect(movie).to.have.property('plot');
      expect(movie).to.have.property('tagline');
      expect(movie).to.have.property('duration', '135 min');
      expect(movie).to.have.property('year', '1992');
      expect(movie).to.have.property('rating', '7.2');

      expect(movie.genres).to.include('Drama');
      expect(movie.genres).to.include('Mystery');
      expect(movie.genres).to.include('Horror');
      expect(movie.genres).to.include('Thriller');

      expect(movie.country).to.include('USA');
      expect(movie.country).to.include('France');
    });
  });

  describe('when `imdbId` is missing', function() {

    it('rejects a promise', function(done) {
      var info = {
        imdbId: null
      };

      fetchMovieDetails(api, info).catch(function(error) {
        expect(error).to.eq('Missing `imdbId`');
        done();
      });
    });

  });

});
