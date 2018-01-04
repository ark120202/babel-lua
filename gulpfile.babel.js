/* @flow */

import gulp from 'gulp';
import babel from 'gulp-babel';
import path from 'path';
import del from 'del';
import combiner from 'stream-combiner2';
import through from 'through2';

function replaceSrcWithLib(file, enc, callback) {
  file.path = path.resolve(file.base, file.relative.replace('src', 'lib'));
  callback(null, file);
}

// export function build() for some reason breaks watch error handling
gulp.task('build', () => {
  const src = path.join(__dirname, 'packages', '*', 'src', '**');
  const dest = path.join(__dirname, 'packages');
  const since = { since: gulp.lastRun('build') };

  return combiner([
    gulp
      .src(path.join(src, '*.js'), since)
      .pipe(through.obj(replaceSrcWithLib))
      .pipe(babel())
      .pipe(gulp.dest(dest)),
    gulp
      .src(path.join(src, '*.d.ts'), since)
      .pipe(through.obj(replaceSrcWithLib))
      .pipe(gulp.dest(dest)),
  ]);
});

export function watch() {
  gulp.parallel('build')(() => null);
  gulp.watch('packages/*/src/**.{js,d.ts}', gulp.task('build')).on('error', () => {});
}

export const clean = () => del('packages/*/lib');

export default gulp.task('build');
