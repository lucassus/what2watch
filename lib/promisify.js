var Q = require('q');

module.exports = function(fn) {
  // return wrapped function
  return function() {
    // grab fn arguments
    var args = Array.prototype.slice.call(arguments);

    return Q.promise(function(resolve, reject) {
      // add callback to the end
      args.push(function(err, files) {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });

      // call the original function
      fn.apply(this, args);
    });
  };
};
