var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp.src('spec/**/*.js', { read: false })
    .pipe(mocha({ ui: 'bdd', reporter: 'spec' }));
});

gulp.task('default', ['test']);
