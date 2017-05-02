var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var gulpCopy = require('gulp-file-copy');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserify = require('gulp-browserify');
var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(['./src/containers/**/*.scss', './src/css/*.scss'])
    .pipe(sass())
      .pipe(autoprefixer({
          browsers: ['last 2 versions', 'last 1 Chrome versions', 'Android >= 4.0'],
          cascade: false
      }))
    .on('error', sass.logError)
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
      .pipe(concat('containers.min.css'))

    .pipe(gulp.dest('./www/css/'))
    .on('end', done);

});

// 文件拷贝
gulp.task("copyhtml", function(){
    gulp.src(["./src/index.html", "./src/templates/*.html", "./src/containers/**/*.html"])
    .pipe(gulp.dest("./www/templates/"))
 });
// 文件拷贝
gulp.task("copycss", function(){
  gulp.src("./src/css/containers.min.css")
    .pipe(gulp.dest("./www/css/"))
});

// 文件图片
gulp.task("copyimg", function(){
    gulp.src(["./src/img/**/*.png", "./src/img/**/*.jpg"])
      .pipe(imagemin())
      .pipe(gulp.dest("./www/img"))
});



gulp.task('scripts', function() {
  gulp.src(['./src/js/serviceModule.js', './src/js/filterModule.js',  './src/js/config.js', './src/containers/**/*.js', './src/js/app.js', './src/js/unit.js'])
    .pipe(rename({dirname: ''}))
    .pipe(uglify({outSourceMap: false}))
      .pipe(gulp.dest('./www/js'))
});

gulp.task('concat.js', function() {
  gulp.src(['./src/js/directiveModule.js', './src/components/**/*.js'])
    .pipe(concat('directiveModule.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./www/js/'))
});


gulp.task('watch', function() {

  gulp.watch(['./src/containers/**/*.scss', './src/css/*.scss'], ['sass']);
    gulp.watch(['./src/index.html', './src/templates/*.html', './src/containers/**/*.html'], ['copyhtml']);
    gulp.watch('./src/img/**/*.png', ['copyimg']);
    gulp.watch(['./src/containers/**/*.js', './src/js/serviceModule.js', './src/js/filterModule.js', './src/js/config.js',  './src/js/app.js', './src/js/unit.js'], ['scripts']);
  gulp.watch(['./src/js/directiveModule.js', './src/components/**/*.js' ], ['concat.js']);
});

gulp.task('uglify', function() {
    return gulp.src('./src/containers/**/*.js')

        .pipe(uglify({outSourceMap: false}))
        .pipe(concat('control.min.js'))
        .pipe(gulp.dest('./www/js/'))
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
//"scripts": {
//    "start": 'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android.apk ydkt',
//    "build": "cordova-hcp build"
//  },
