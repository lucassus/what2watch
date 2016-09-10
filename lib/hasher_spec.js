var path = require('path');

var expect = require('chai').expect;
var helper = require('../spec_helpers');

var hasher = require('./hasher');

describe('hasher module', function() {

  it('calculates file hash', function() {
    var filePath = helper.fixturePath('movies/one.avi');

    return hasher(filePath).then(function(hash) {
      expect(hash).to.eq('0000000014cadce2');
    });
  });

  it('calculates file hash', function() {
    var filePath = helper.fixturePath('movies/two.mkv');

    return hasher(filePath).then(function(hash) {
      expect(hash).to.eq('0000000014deeeec');
    });
  });

});
