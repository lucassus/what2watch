var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('test', function (cb) {
  gulp.src(['lib/**/!(*_spec).js'])
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['lib/**/*_spec.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: '.coverage',
          reporters: ['html', 'text']
        }))
        .on('end', cb);
    });
});

gulp.task('default', ['test']);
