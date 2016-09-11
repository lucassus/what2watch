var _ = require('lodash');

var MAPPING = {
  title: 'MovieName',
  imdbId: 'MovieImdbID',
  year: 'MovieYear',
  kind: 'MovieKind'
};

module.exports = function(api, stat) {
  return api.login().then(function() {
    return api.checkMovieHash(stat.hash);
  }).then(function(result) {
    return _.chain(MAPPING)
      .toPairs()
      .map(function(pair) { return [pair[0], result[pair[1]]]; })
      .fromPairs()
      .value();
  });
};
