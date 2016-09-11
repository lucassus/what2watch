var Promise = require('bluebird');

module.exports = function(api, info) {
  var imdbId = info.imdbId;

  if (imdbId) {
    return api.getIMDBMovieDetails(imdbId);
  } else {
    return Promise.reject('Missing `imdbId`');
  }
};
