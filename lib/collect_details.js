var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(api, stats, tick) {
  return api.login().then(function() {
    return Promise.map(stats, function(stat) {
      var imdbId = _.get(stat, 'movie.imdbId');

      var promise = imdbId ?
        api.getIMDBMovieDetails(imdbId) :
        Promise.reject('Missing `imdbId`');

      return promise.then(function(details) {
        _.extend(stat.movie, details);
        return stat;
      }).catch(function() {
        return stat;
      }).finally(function() {
        tick({ total: stat.length });
      });
    }, { concurrency: 8 });
  });
};
