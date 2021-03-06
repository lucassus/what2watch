var Promise = require('bluebird');
var xmlrpc = require('xmlrpc');

var XMLRPC_CLIENT_OPTIONS = {
  host: 'api.opensubtitles.org',
  path: '/xml-rpc'
};

/**
 * Simple wrapper for OpenSubtitles API
 * @constructor
 */
var OpenSubtitles = function() {
  this.xmlrpcClient = xmlrpc.createClient(XMLRPC_CLIENT_OPTIONS);
  this.token = null;
};

OpenSubtitles.prototype = {

  methodCall: function(name, params) {
    var methodCall = Promise.promisify(this.xmlrpcClient.methodCall, {
      context: this.xmlrpcClient
    });

    return methodCall(name, params).then(function(response) {
      if (response.status !== '200 OK') {
        return Promise.reject(response);
      }

      return response;
    });
  },

  // See http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC#LogIn
  login: function() {
    if (this.isLogged()) { return Promise.resolve(this.token); }

    var params = [
      '', // $username
      '', // $password
      'en', // $language
      'OpenSubtitlesPlayer v4.7' // $useragent
    ];

    return this.methodCall('LogIn', params).then(function(response) {
      this.token = response.token;
      return this.token;
    }.bind(this));
  },

  isLogged: function() {
    return Boolean(this.token);
  },

  // See http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC#CheckMovieHash
  checkMovieHash: function(hash) {
    var params = [this.token, [hash]];
    return this.methodCall('CheckMovieHash', params).then(function(response) {
      var result = response.data[hash];

      if (result['MovieImdbID']) {
        return result;
      } else {
        return Promise.reject(response);
      }
    });
  },

  // See http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC#GetIMDBMovieDetails
  getIMDBMovieDetails: function(imdbId) {
    var params = [this.token, imdbId];
    return this.methodCall('GetIMDBMovieDetails', params).then(function(response) {
      return response.data;
    });
  }

};

module.exports = OpenSubtitles;
