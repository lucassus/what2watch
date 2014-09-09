var Q = require('q');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var Long = require('long');

var getFileDescriptor = function(file) {
  var deferred = Q.defer();

  fs.open(file, 'r', function(status, fd) {

    fs.stat(file, function(err, stats) {
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

    // get the number of bytes
    buffer = buffer.slice(0, num);

    // sum the
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

module.exports = function(file) {
  var deferred = Q.defer();

  getFileDescriptor(file).spread(function(fd, size) {
    var chunkSize = 64 * 1024;
    if (size < chunkSize) { chunkSize = size; }

    return [fd, size, chunkSize];
  }).spread(function(fd, size, chunkSize) {
    // get the head
    return longSumChunk(fd, 0, chunkSize).then(function(head) {
      var start = size - chunkSize;
      if (start < 0) { start = 0; }

      // get the tail
      return longSumChunk(fd, start, chunkSize).then(function(tail) {
        return [head, tail, size]
      });
    });
  }).spread(function(head, tail, size) {
    // sum all values
    var sum = head.add(tail).add(new Long(size));

    // convert value to unsigned
    var sumHex = sum.toUnsigned().toString(16);

    deferred.resolve(sumHex);
  });

  return deferred.promise;
};
