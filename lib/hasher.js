var Buffer = require('buffer').Buffer;
var Long = require('long');
var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');

var open = Promise.promisify(fs.open);
var stat = Promise.promisify(fs.stat);
var read = Promise.promisify(fs.read);

function getFileDescriptor(filePath) {
  return open(filePath, 'r').then(function(fd) {
    return stat(filePath).then(function(stats) {
      return [fd, stats.size];
    });
  });
}

var longSumChunk = function(fd, start, length) {
  var buffer = new Buffer(length);

  return read(fd, buffer, 0, length, start).then(function(num) {
    buffer = buffer.slice(0, num);

    var hNumber = new Long();
    for (var i = 0; i < buffer.length; i += 8) {

      var low = buffer.readUInt32LE(i, true);
      var high = buffer.readUInt32LE(i + 4, true);

      var n = new Long(low, high);
      hNumber = hNumber.add(n);
    }

    return hNumber;
  }).catch(function() {
    return new Long();
  });
};

module.exports = function(filePath) {
  return getFileDescriptor(filePath).spread(function(fd, size) {
    var chunkSize = 64 * 1024;
    if (size < chunkSize) { chunkSize = size; }

    return [fd, size, chunkSize];
  }).spread(function(fd, size, chunkSize) {
    var getHead = function() {
      return longSumChunk(fd, 0, chunkSize);
    };

    var getTail = function() {
      var start = size - chunkSize;
      if (start < 0) { start = 0; }

      return longSumChunk(fd, start, chunkSize);
    };

    return [getHead(), getTail(), size];
  }).spread(function(head, tail, size) {
    var sum = head.add(tail).add(new Long(size));
    var hash = sum.toUnsigned().toString(16);
    return _.padStart(hash, 16, '0');
  });
};
