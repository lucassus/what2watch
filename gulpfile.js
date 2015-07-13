var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('jscs', function () {
  return gulp.src(['lib/**/*.js', 'bin/*'])
    .pipe(jscs());
});

gulp.task('lint', function() {
  return gulp.src(['lib/**/*.js', 'bin/*'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function (cb) {
  gulp.src(['lib/**/!(*_spec).js'])
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['lib/**/*_spec.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: '.coverage',
          reporters: ['html', 'text', 'lcovonly']
        }))
        .on('end', cb);
    });
});

gulp.task('default', ['lint', 'jscs', 'test']);
