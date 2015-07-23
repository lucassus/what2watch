var program = require('commander');

var parseList = function(list) {
  return list.split(',').map(function(format) {
    return format.trim();
  });
};

var DEFAULT_FORMATS = ['avi', 'mkv', 'mp4', 'mpg'];

program
  .version(require('../package.json').version)
  .option('-f, --formats [formats]',
    'list of movie formats to process, default ' + DEFAULT_FORMATS.join(', '),
    parseList)
  .option('-d, --directory [directory]', 'working directory')
  .parse(process.argv);

if (!program.formats) {
  program.formats = DEFAULT_FORMATS;
}

module.exports = program;
