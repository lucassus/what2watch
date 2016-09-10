var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(api, info) {
  return api.login().then(function() {
    var imdbId = info.imdbId;

    if (imdbId) {
      return api.getIMDBMovieDetails(imdbId);
    } else {
      return Promise.reject('Missing `imdbId`');
    }
  });
};
