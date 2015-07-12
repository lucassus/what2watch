var Q = require('q');
var _ = require('lodash');
var glob = require('glob');
var path = require('path');

module.exports = function(formats, directory) {
  var deferred = Q.defer();

  var pattern = '**/*.+(' + formats.join('|') +  ')';
  glob(pattern, { cwd: directory, dot: false }, deferred.makeNodeResolver());

  return deferred.promise.then(function(files) {
    if (files.length === 0) {
      return Q.reject('No movies found!');
    }

    return files;
  }).then(function(files) {
    return _.map(files, function(filePath) {
      return path.join(directory, filePath);
    });
  });
};
