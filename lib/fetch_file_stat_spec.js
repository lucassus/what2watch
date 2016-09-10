var expect = require('chai').expect;
var helper = require('../spec_helpers');

var fetchFileStat = require('./fetch_file_stat');

describe('.fetchFileStat', function() {

  it('collects file stats', function() {
    var path = helper.fixturePath('movies/movie/movie.avi');

    return fetchFileStat(path).then(function(file) {
      expect(file.path).to.match(new RegExp('movie/movie.avi$'));
      expect(file.size).to.eq(10);
      expect(file.hash).to.eq('d2ecdeda40cad0f2');
      expect(file.downloadedAt).to.be.a('date');
    });
  });

  it('collects file stats', function() {
    var path = helper.fixturePath('movies/one.avi');

    return fetchFileStat(path).then(function(file) {
      expect(file.path).to.match(new RegExp('one.avi$'));
      expect(file.size).to.eq(4);
      expect(file.hash).to.eq('0000000014cadce2');
      expect(file.downloadedAt).to.be.a('date');
    });
  });

});
