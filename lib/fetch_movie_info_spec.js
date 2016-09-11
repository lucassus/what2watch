var _ = require('lodash');
var nock = require('nock');
var sinon = require('sinon');

var expect = require('chai').expect;
var helper = require('../spec_helpers');

var OpenSubtitles = require('./open_subtitles');
var fetchMovieInfo = require('./fetch_movie_info');

describe('.fetchMovieInfo', function() {

  var api;

  beforeEach(function() {
    api = new OpenSubtitles();
    api.token = 'teh token';
  });

  it('fetches movie info', function() {
    nock('http://api.opensubtitles.org').post('/xml-rpc')
      .replyWithFile(200, helper.fixturePath('replies/fetch_movie_info/success.xml'));

    var stat = {
      hash: '4186ff4b928e4159'
    };

    return fetchMovieInfo(api, stat).then(function(info) {
      expect(info).to.have.property('title', 'Twin Peaks: Fire Walk with Me');
      expect(info).to.have.property('imdbId', '0105665');
      expect(info).to.have.property('year', '1992');
      expect(info).to.have.property('kind', 'movie');
    });
  });

});
