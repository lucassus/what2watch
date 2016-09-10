var Promise = require('bluebird');
var fs = require('fs');

var hasher = require('./hasher');
var stat = Promise.promisify(fs.stat);

module.exports = function(paths, tick) {
  return Promise.map(paths, function(path) {
    return stat(path).then(function(stats) {
      return {
        file: {
          path: path,
          size: stats.size,
          downloadedAt: stats.ctime
        }
      };
    }).then(function(stats) {
      return hasher(stats.file.path).then(function(hash) {
        stats.file.hash = hash;
        return stats;
      });
    }).finally(function() {
      tick({ total: paths.length });
    });
  }, { concurrency: 2 });
};
