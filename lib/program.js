var _ = require('lodash');
var program = require('commander');

var list = function(val) {
  return _(val.split(',')).map(function(format) {
    return format.trim();
  });
};

program
  .version('0.0.1')
  .option('-f, --formats [formats]', 'list of movie formats to process, default avi,mkv,mp4,mpg', list)
  .option('-d, --directory [directory]', 'working directory')
  .parse(process.argv);

if (!program.formats) {
  program.formats = ['avi', 'mkv', 'mp4', 'mpg'];
}

module.exports = program;
