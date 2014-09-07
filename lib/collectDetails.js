var Q = require('q');
var _ = require('lodash');

module.exports = function(api, stats) {
  var promise = Q.promise(function(resolve, reject, notify) {
    api.login().then(function() {
      var promises = _.map(stats, function(stat) {
        var promise = stat.movie && stat.movie.imdbId ?
          api.getIMDBMovieDetails(stat.movie.imdbId) :
          Q.reject('missing');

        return promise.then(function(details) {
          _.extend(stat.movie, details);
        }).finally(function() {
          notify({ total: stats.length });
        });
      });

      return Q.allSettled(promises).then(resolve);
    });
  });

  return promise.thenResolve(stats);
};
