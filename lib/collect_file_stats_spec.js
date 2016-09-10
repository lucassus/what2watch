var expect = require('chai').expect;
var helper = require('../spec_helpers');

var findMovies = require('./find_movies');
var collectFilesStats = require('./collect_file_stats');

describe('.collectFilesStats', function() {

  var files;

  beforeEach(function() {
    return findMovies(['avi', 'mkv'], helper.fixturePath('movies'))
      .then(function(_files_) { files = _files_; });
  });

  it('collects file stats', function() {
    var noopTick = function() {};

    return collectFilesStats(files, noopTick).then(function(stats) {
      expect(stats).to.have.length(3);

      expect(stats[0].file.path).to.match(new RegExp('movie/movie.avi$'));
      expect(stats[0].file.size).to.eq(10);
      expect(stats[0].file.hash).to.eq('d2ecdeda40cad0f2');
      expect(stats[0].file.downloadedAt).to.be.a('date');

      expect(stats[1].file.path).to.match(new RegExp('one.avi$'));
      expect(stats[1].file.size).to.eq(4);
      expect(stats[1].file.hash).to.eq('0000000014cadce2');
      expect(stats[1].file.downloadedAt).to.be.a('date');
    });
  });

});
