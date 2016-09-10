var Promise = require('bluebird');
var _ = require('lodash');

var MAPPING = {
  title: 'MovieName',
  imdbId: 'MovieImdbID',
  year: 'MovieYear',
  kind: 'MovieKind'
};

module.exports = function(api, stats, tick) {
  return api.login().then(function() {
    return Promise.map(stats, function(stat) {
      return api.checkMovieHash(stat.file.hash).then(function(result) {
        var movie = _.chain(MAPPING)
          .toPairs()
          .map(function(pair) { return [pair[0], result[pair[1]]]; })
          .fromPairs()
          .value();

        return _.extend(stat, { movie: movie });
      }).catch(function() {
        return stat;
      }).finally(function() {
        tick({ total: stat.length });
      });
    }, { concurrency: 8 });
  });
};
