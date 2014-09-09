var expect = require('chai').expect;
var path = require('path');

describe('hasher module', function() {
  var hasher = require('../lib/hasher');

  var getFixturePath = function(name) {
    return path.join(__dirname, 'fixtures', name);
  };

  it('calculates file hash', function() {
    var filePath = getFixturePath('one.avi');

    return hasher(filePath).then(function(hash) {
      expect(hash).to.eq('14cadce2');
    });
  });

  it('calculates file hash', function() {
    var filePath = getFixturePath('two.mkv');

    return hasher(filePath).then(function(hash) {
      expect(hash).to.eq('14deeeec');
    });
  });
});
