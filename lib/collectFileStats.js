var Q = require('q');
var _ = require('lodash');
var fs = require('fs');

var hasher = require('./hasher');

var fileStats = function(file) {
  return Q.promise(function(resolve, reject) {
    fs.stat(file, function(err, stats) {
      if (err) { return reject(err); }

      resolve({
        file: {
          path: file,
          size: stats.size,
          downloadedAt: stats.ctime
        }
      });
    });
  }).then(function(stats) {
    return hasher(stats.file.path).then(function(hash) {
      stats.file.hash = hash;
      return stats;
    });
  });
};

module.exports = function(files) {
  return Q.promise(function(resolve, reject, notify) {
    var promises = _.map(files, function(file) {
      return fileStats(file)
        .catch(reject)
        .finally(function() {
          notify({ total: files.length })
        });
    });

    return Q.all(promises).then(resolve);
  });
};
