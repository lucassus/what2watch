var Q = require('q');
var _ = require('lodash');
var fs = require('fs');

var hasher = require('./hasher');

var fileStats = function(filePath) {
  var deferred = Q.defer();
  fs.stat(filePath, deferred.makeNodeResolver());

  return deferred.promise.then(function(stats) {
    return {
      file: {
        path: filePath,
        size: stats.size,
        downloadedAt: stats.ctime
      }
    };
  }).then(function(stats) {
    return hasher(stats.file.path).then(function(hash) {
      stats.file.hash = hash;
      return stats;
    });
  });
};

module.exports = function(files) {
  return Q.promise(function(resolve, reject, notify) {
    var promises = _.map(files, function(filePath) {
      return fileStats(filePath)
        .catch(reject)
        .finally(function() {
          notify({ total: files.length })
        });
    });

    return Q.all(promises).then(resolve);
  });
};
