'use-strict';

// All gulp plugins. Removing these will cause an error.

var        gulp = require('gulp'),
           sass = require('gulp-sass'),
           csso = require('gulp-csso'),
         uglify = require('gulp-uglify'),
        plumber = require('gulp-plumber'),
       imagemin = require('gulp-imagemin'),
            del = require('del'),
            iff = require('gulp-if'),
         series = require('stream-series'),
       template = require('gulp-template'),
          pages = require('gulp-gh-pages'),
          bower = require('gulp-bower'),
         notify = require('gulp-notify'),
 mainBowerFiles = require('main-bower-files'),
         useref = require('gulp-useref'),
         filter = require('gulp-filter'),
         inject = require('gulp-inject'),
    browserSync = require('browser-sync').create(),
     sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('run-sequence'),
          watch = require('gulp-watch'),
     autoprefix = require('gulp-autoprefixer');
// End Modules

// Directory names
// Edit these to suit your normal naming conventions. Note: pay attention to trailing slashes.

var dir = {
         src : './src/',
        dist : './dist/',
       bower : './bower_components/',
        sass : 'scss/',
        css  : 'css/',
      fonts  : 'fonts/',
        img  : 'assets/',
        js   : 'js/',
  bowerFiles : 'bowerFiles/',
};

// End of Variables. You do not need to change anything after this unless you want to change how tasks perform.

// The path to all your directories

var path = {
     distCss : dir.dist + dir.css,
      distJs : dir.dist + dir.js,
     distImg : dir.dist + dir.img,
      srcCss : dir.src + dir.css,
      srcImg : dir.src + dir.img,
    srcFonts : dir.src + dir.fonts,
      srcCss : dir.src + dir.css,
       srcJs : dir.src + dir.js,
    srcBower : dir.src + dir.bowerFiles,
     srcSass : dir.src + dir.sass
};


// ============================================================================ //
// MAIN GULP TASKS
// ============================================================================ //

// ===================== //
// gulp
//
// Installs all bower dependencies
// Moves main files from bower components folder to your JS/CSS folder
// Links all js files into the bottom of your html doc(s) - lists Jquery first and main.js last
// Fires up a local development server
// Watches for any changes in your file structure, compiling sass, reloading the browser and relinking js files into html docs on the fly
// hit crtl c into the command line to stop watching files.
// ===================== //

gulp.task('default',function(cb) {
  runSequence(
              'setup',
              'serve',
              cb);
});


// ===================== //
// gulp serve
//
// Same as default task but without the bower part.
// Use in continuous development
// ===================== //

gulp.task('serve', ['compileSass', 'watchFiles'], function() {

    browserSync.init({
        server: dir.src
    });

    gulp.watch([path.srcSass + '**/*.scss'], ['compileSass']);
    gulp.watch([dir.src + '*.html']).on('change', browserSync.reload);
    gulp.watch([path.srcJs + '**/*.js']).on('change', browserSync.reload);
    gulp.watch([path.srcImg + '**/*.*']).on('change', browserSync.reload);
});

// ===================== //
// gulp build
//
// Deletes current dist folder and all compiled css in app.css
// Compiles sass to css in app.css
// Optimizes all images in assets folder
// Concats and minifies all js files into app.min.js and writes the link to this in html docs
// Moves all production ready files from src folder to dist folder
// ===================== //

gulp.task('build',function(cb){
  runSequence(
              'clean',
              ['html', 'image'],
              'moveToDist',

              cb);
});

// ===================== //
// gulp deploy
// Runs the build task
// Pushes everything in the dist folder to be served on gh pages branch of github repo
// ===================== //

gulp.task('deploy',['build'] ,function(){
  return gulp.src(dir.dist + '/**/*')
             .pipe(pages());
});









// ============================================================================ //
// MINOR GULP TASKS - FEED MAIN TASKS
// ============================================================================ //

// Watch for bower and js folders for change and updatelinks in html

gulp.task('watchFiles', function () {
      watch([dir.bower + '**', path.srcJs + '*.js'] , {events: ['add','unlink']}, function () {
              gulp.start('inject');
          });
});

// Deletes dist folder and compiled css.

gulp.task('clean', function() {
  del([dir.dist , path.srcCss + 'app.scss*']);
});

// Install bower packages, link js files in html docs

gulp.task('setup',function(cb) {
  runSequence(
              'bower',
              'inject',
              cb);
});

// Delete any current Bower directory

gulp.task('cleanBower', function(){
    del(dir.bower + '**/*');
});

// Install all Bower packages according to bower.json

gulp.task('bower', function(){
  return bower()
        .pipe(gulp.dest(dir.bower))
});

// Move main bower files into js or css folder in src folder
var moveCss = function(){
  return gulp.src(mainBowerFiles())
      .pipe(filter('*.css'))
      .pipe(gulp.dest(path.srcCss))
};
var moveJs = function(){
  return gulp.src(mainBowerFiles({paths: {bowerJson: 'bower.json', bowerDirectory: dir.bower }}))
      .pipe(filter('**/**.js*'))
      .pipe(gulp.dest(path.srcJs))

};

gulp.task('moveBowerFiles', function(){

  moveCss();
  moveJs();
});

// Inject files in js folder into html docs for development

gulp.task('inject', ['moveBowerFiles'],function(){
  var otherFiles = gulp.src([path.srcJs + '*.js','!' + path.srcJs + 'jquery.js' , '!' + path.srcJs + 'main.js']),
      jQueryFile = gulp.src([path.srcJs + 'jquery.js']),
        mainFile = gulp.src(path.srcJs + 'main.js');

  gulp.src(dir.src + '**/*.html')
      .pipe(inject(series(jQueryFile, otherFiles, mainFile), {read: false , relative: true}))
      .pipe(gulp.dest(dir.src));
});

// compiles sass

// custom error handling

function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      // Customizing error title
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
    })
  });
}


gulp.task('compileSass', function(){
  return gulp.src(path.srcSass + 'app.scss')
             .pipe(customPlumber('Sass broke'))
             .pipe(sourcemaps.init())
             .pipe(sass())
             .pipe(autoprefix('last 5 versions'))
             .pipe(sourcemaps.write('.'))
             .pipe(gulp.dest(path.srcCss))
             .pipe(browserSync.stream({match: '**/*.css'}));
});

// Optimize images

gulp.task('image', function(){
  return gulp.src(path.srcImg + '**.*')
             .pipe(imagemin())
             .pipe(gulp.dest(path.distImg));
});

// Concat and minify js and css, rename, rewrite links in html and move to dist folder

gulp.task('html', ['compileSass'] , function() {
  var assets = useref.assets();
  gulp.src(dir.src + '*.html')
      .pipe(assets)
      .pipe(iff('*.js', uglify()))
      .pipe(iff('*.css' , csso()))
      .pipe(assets.restore())
      .pipe(useref())
      .pipe(gulp.dest(dir.dist));
});

// move files from src to dist

gulp.task('moveToDist', function(){
  return gulp.src([path.srcCss + '**',  path.srcFonts + '**'], { base: dir.src })
             .pipe(gulp.dest(dir.dist));

});
