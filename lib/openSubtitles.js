var Q = require('q');
var _ = require('lodash');
var xmlrpc = require('xmlrpc');

var OpenSubtitles = function() {
  this.client = xmlrpc.createClient({ host: 'api.opensubtitles.org', path: '/xml-rpc'});
  this.token = null;
};

OpenSubtitles.prototype = {

  methodCall: function(name, params) {
    var deferred = Q.defer();

    this.client.methodCall(name, params, function(err, response) {
      if (err) { return deferred.reject(err); }

      if (response.status === '200 OK') {
        deferred.resolve(response);
      } else {
        deferred.reject(response);
      }
    });

    return deferred.promise;
  },

  logged: function() {
    return !!this.token;
  },

  login: function() {
    if (this.logged()) { return Q(this.token); }

    return this.methodCall('LogIn', ['', '', 'en', 'OpenSubtitlesPlayer v4.7']).then(function(response) {
      this.token = response.token;
      return this.token;
    }.bind(this));
  },

  checkMovieHash: function(hash) {
    var deferred = Q.defer();

    this.methodCall('CheckMovieHash', [this.token, [hash]]).then(function(response) {
      var result = response.data[hash];

      if (result['MovieImdbID']) {
        deferred.resolve(result);
      } else {
        deferred.reject(response);
      }
    }, deferred.reject);

    return deferred.promise;
  },

  getIMDBMovieDetails: function(imdbId) {
    return this.methodCall('GetIMDBMovieDetails', [this.token, imdbId]).then(function(response) {
      return response.data;
    });
  }
};

module.exports = OpenSubtitles;
