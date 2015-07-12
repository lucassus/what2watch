var Q = require('q');
var _ = require('lodash');
var glob = require('glob');
var path = require('path');

module.exports = function(formats, directory) {
  var deferred = Q.defer();

  var pattern = '**/*.+(' + formats.join('|') +  ')';
  glob(pattern, { cwd: directory, dot: false }, function(err, files) {
    if (err) { return deferred.reject(err); }

    if (files.length > 0) {
      deferred.resolve(files);
    } else {
      deferred.reject('No movies found!');
    }
  });

  return deferred.promise.then(function(files) {
    return _.map(files, function(filePath) {
      return path.join(directory, filePath);
    });
  });
};
