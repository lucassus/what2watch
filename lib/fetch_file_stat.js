var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');

var hasher = require('./hasher');
var stat = Promise.promisify(fs.stat);

module.exports = function(path) {
  return Promise.all([stat(path), hasher(path)]).spread(function(stats, hash) {
    return _.extend({}, {
      path: path,
      size: stats.size,
      downloadedAt: stats.ctime
    }, {
      hash: hash
    });
  });
};
