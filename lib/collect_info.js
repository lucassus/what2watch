var Q = require('q');
var _ = require('lodash');

module.exports = function(api, stats) {
  var mapping = {
    title: 'MovieName', imdbId: 'MovieImdbID',
    year: 'MovieYear', kind: 'MovieKind'
  };

  var promise = Q.promise(function(resolve, reject, notify) {
    api.login().then(function() {
      var promises = _.map(stats, function(stat) {
        var promise = api.checkMovieHash(stat.file.hash);

        return promise.then(function(result) {
          var details =_.chain(mapping)
            .pairs()
            .map(function(pair) { return [pair[0], result[pair[1]]]; })
            .zipObject()
            .value();

          _.extend(stat, { movie: details });
        }).finally(function() {
          notify({ total: stats.length });
        });
      });

      return Q.allSettled(promises).then(resolve);
    }).done();
  });

  return promise.thenResolve(stats);
};
