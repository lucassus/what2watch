var _ = require('lodash');
var Q = require('q');

module.exports = function(api, stats) {
  var promise = Q.promise(function(resolve, reject, notify) {
    api.login().then(function() {
      var promises = _.map(stats, function(stat) {
        var imdbId = _.get(stat, 'movie.imdbId');

        var promise = imdbId ?
          api.getIMDBMovieDetails(imdbId) :
          Q.reject('Missing id:', imdbId);

        return promise.then(function(details) {
          _.extend(stat.movie, details);
        }).finally(function() {
          notify({ total: stats.length });
        });
      });

      return Q.allSettled(promises).then(resolve);
    }).done();
  });

  return promise.thenResolve(stats);
};
