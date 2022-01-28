
const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const purgeSourcemaps = require('gulp-purge-sourcemaps');

const cssDest = 'assets/lib/css';

function fontAwesome(){
   return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*-solid-*.*')
               .pipe(gulp.dest('assets/lib/webfonts'));
}

function css() {
   return gulp.src(['node_modules/@fortawesome/fontawesome-free/css/all.css'])
              .pipe(rename('fontAwesome.css'))
      .pipe(gulp.src([
         'node_modules//bootstrap//dist//css//bootstrap.css'
      ]))
      //.pipe(concat('styles.css'))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(purgeSourcemaps())
      .pipe(gulp.dest(cssDest))
      .pipe(concat('all.min.css'))
      .pipe(cleanCSS())
      .pipe(gulp.dest(cssDest));
}

function js() {
   return gulp.src([
       'node_modules/@popperjs/core/dist/umd/popper.js',
       'node_modules/bootstrap/dist/js/bootstrap.js',
       'node_modules/jquery/dist/jquery.js'
    ])
      //.pipe(concat('scripts.min.js'))
      //.pipe(uglify())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(purgeSourcemaps())
      .pipe(gulp.dest('assets/lib/js'));
}

// function img() {
//    return gulp.src('assets/img/*')
//       .pipe(imagemin([
//          imagemin.mozjpeg({optimizationLevel: 5})
//       ]))
//       .pipe(gulp.dest('dist-gulp/img'));
// }

exports.default = gulp.parallel(css,js,fontAwesome);
