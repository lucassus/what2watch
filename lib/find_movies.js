var Promise = require('bluebird');
var _ = require('lodash');
var path = require('path');

var glob = Promise.promisify(require('glob'));

module.exports = function(formats, directory) {
  var pattern = ['**/*.+(', formats.join('|'), ')'].join('');

  return glob(pattern, { cwd: directory, dot: false }).then(function(files) {
    if (files.length === 0) {
      return Promise.reject('No movies found!');
    }

    return files;
  }).then(function(files) {
    return _.map(files, function(filePath) {
      return path.join(directory, filePath);
    });
  });
};
