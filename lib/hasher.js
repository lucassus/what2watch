var Q = require('q');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var Long = require('long');

var getFileDescriptor = function(filePath) {
  var deferred = Q.defer();

  fs.open(filePath, 'r', function(status, fd) {

    fs.stat(filePath, function(err, stats) {
      if (err) { return deferred.reject(err); }
      deferred.resolve([fd, stats.size]);
    });

  });

  return deferred.promise;
};

var longSumChunk = function(fd, start, length) {
  var deferred = Q.defer();

  var buffer = new Buffer(length);

  fs.read(fd, buffer, 0, length, start, function(err, num) {
    if (err) { return deferred.resolve(new Long()); }

    buffer = buffer.slice(0, num);

    var hNumber = new Long();
    for (var i = 0; i < buffer.length; i += 8) {

      var low = buffer.readUInt32LE(i, true);
      var high = buffer.readUInt32LE(i + 4, true);

      var n = new Long(low, high);
      hNumber = hNumber.add(n);
    }

    deferred.resolve(hNumber);
  });

  return deferred.promise;
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
    return sum.toUnsigned().toString(16);
  });
};
