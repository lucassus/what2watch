var _ = require('lodash');
var nock = require('nock');
var sinon = require('sinon');

var expect = require('chai').expect;
var helper = require('../spec_helpers');

var OpenSubtitles = require('./open_subtitles');

describe('OpenSubtitles', function() {

  var openSubtitles, sandbox;

  beforeEach(function() {
    openSubtitles = new OpenSubtitles();

    sandbox = sinon.sandbox.create();
    sandbox.spy(openSubtitles.xmlrpcClient, 'methodCall')
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('.login', function() {

    it('calls valid xmlrpc method', function() {
      // When
      openSubtitles.login();

      // Then
      var args = openSubtitles.xmlrpcClient.methodCall.lastCall.args;
      expect(args[0]).to.eq('LogIn');
      expect(args[1][2]).to.eq('en');
      expect(args[1][3]).to.eq('OpenSubtitlesPlayer v4.7');
    });

    describe('on success', function() {

      beforeEach(function() {
        nock('http://api.opensubtitles.org').post('/xml-rpc')
          .replyWithFile(200, helper.fixturePath('replies/login/success.xml'));
      });

      it('resolves the token', function() {
        return openSubtitles.login().then(function(token) {
          expect(token).to.eq('pboeg235h9ko7hf0h6567lk9i6');
        });
      });

    });

    describe('when the client is already logged', function() {

      beforeEach(function() {
        openSubtitles.token = 'the token';
      });

      it('resolved the token', function() {
        return openSubtitles.login().then(function(token) {
          expect(token).to.eq(openSubtitles.token);
        })
      });

    });

    describe('on error', function() {

      beforeEach(function() {
        nock('http://api.opensubtitles.org').post('/xml-rpc')
          .replyWithFile(200, helper.fixturePath('replies/login/error.xml'));
      });

      it('rejects with an error', function() {
        return openSubtitles.login().catch(function(error) {
          expect(error).to.have.property('status', '414 Unknown User Agent');
        });
      });

    });

  });

  describe('.isLogged', function() {

    describe('when the client is logged', function() {

      beforeEach(function() {
        openSubtitles.token = 'the token';
      });

      it('returns true', function() {
        expect(openSubtitles.isLogged()).to.be.true;
      });

    });

    describe('when the client is not logged', function() {

      it('returns false', function() {
        expect(openSubtitles.isLogged()).to.be.false;
      });

    });

  });

  describe('.checkMovieHash', function() {

    it('calls valid xmlrpc method', function() {
      // When
      openSubtitles.checkMovieHash('the hash');

      // Then
      var args = openSubtitles.xmlrpcClient.methodCall.lastCall.args;
      expect(args[0]).to.eq('CheckMovieHash');
      expect(args[1][1]).to.deep.eq(['the hash']);
    });

    describe('on success', function() {

      beforeEach(function() {
        nock('http://api.opensubtitles.org').post('/xml-rpc')
          .replyWithFile(200, helper.fixturePath('replies/check_movie_hash/success.xml'));
      });

      it('resolves movie info', function() {
        return openSubtitles.checkMovieHash('8e245d9679d31e12').then(function(info) {
          expect(info).to.have.property('MovieHash', '8e245d9679d31e12');
          expect(info).to.have.property('MovieImdbID', '0462538');
          expect(info).to.have.property('MovieName', 'The Simpsons Movie');
          expect(info).to.have.property('MovieYear', '2007');
          expect(info).to.have.property('MovieKind', 'movie');
        });
      });

    });

    describe('when the hash is missing', function() {

      beforeEach(function() {
        nock('http://api.opensubtitles.org').post('/xml-rpc')
          .replyWithFile(200, helper.fixturePath('replies/check_movie_hash/missing_hash.xml'));
      });

      it('rejects the response', function() {
        var missingHash = '14deeeec';

        return openSubtitles.checkMovieHash(missingHash).catch(function(response) {
          expect(response.data[missingHash]).to.have.length(0);
        });
      });

    });

  });

  describe('.getIMDBMovieDetails', function() {

    it('calls valid xmlrpc method', function() {
      // When
      openSubtitles.getIMDBMovieDetails('0121766');

      // Then
      var args = openSubtitles.xmlrpcClient.methodCall.lastCall.args;
      expect(args[0]).to.eq('GetIMDBMovieDetails');
      expect(args[1][1]).to.eq('0121766');
    });

    describe('on success', function() {

      beforeEach(function() {
        nock('http://api.opensubtitles.org').post('/xml-rpc')
          .replyWithFile(200, helper.fixturePath('replies/get_imdb_movie_details/success.xml'));
      });

      it('resolved move details', function() {
        return openSubtitles.getIMDBMovieDetails('0121766').then(function(details) {
          expect(details.title).to.eq('Star Wars: Episode III - Revenge of the Sith');
          expect(details.genres).to.have.length(4);
          expect(details.plot).to.have.include('As the Clone Wars near an end');
          expect(details.duration).to.eq('140 min');
          expect(details.country).to.deep.eq(['USA']);
          expect(details.year).to.eq('2005');
        });
      });

    });

    describe('on error', function() {

      beforeEach(function() {
          nock('http://api.opensubtitles.org').post('/xml-rpc')
            .replyWithFile(200, helper.fixturePath('replies/get_imdb_movie_details/error.xml'));
        });

      it('rejects an error', function() {
        return openSubtitles.getIMDBMovieDetails('0121766').catch(function(error) {
          expect(error).to.have.property('status', '408 Invalid parameters');
        });
      });

    });

  });

});
