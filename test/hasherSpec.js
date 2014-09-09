var expect = require('chai').expect;
var path = require('path');

describe('hasher module', function() {
  var hasher = require('../lib/hasher');

  it('calculates file hash', function(done) {
    var file = path.join(__dirname, 'fixtures', 'one.txt');

    hasher(file).done(function(hash) {
      expect(hash).to.eq('14cadce2');
      done();
    });
  });

  it('calculates file hash', function(done) {
    var file = path.join(__dirname, 'fixtures', 'two.txt');

    hasher(file).done(function(hash) {
      expect(hash).to.eq('14deeeec');
      done();
    });
  });
});
