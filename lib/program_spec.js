var expect = require('chai').expect;

var program = require('./program');

describe('program', function() {

  beforeEach(function() {
    program.parse(['', '', '-d', '/foo/bar'])
  });

  describe('directory', function() {

    it('can be overridden', function() {
      expect(program.directory).to.eq('/foo/bar');
    });

  });

  describe('formats', function() {

    it('has default values', function() {
      expect(program.formats).to.be.an('array');
      expect(program.formats).to.include('avi');
      expect(program.formats).to.include('mkv');
      expect(program.formats).to.include('mp4');
      expect(program.formats).to.include('mpg');
    });

    it('can be overridden', function() {
      program.parse(['', '', '-f', 'gif, swf']);

      expect(program.formats).to.be.an('array');
      expect(program.formats).to.have.length(2);
      expect(program.formats).to.include('gif');
      expect(program.formats).to.include('swf');
    });

  });

});
