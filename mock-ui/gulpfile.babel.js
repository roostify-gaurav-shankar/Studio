
'use strict';

var gulp = require('gulp');
var gulpIf = require('gulp-if');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var access = require('gulp-accessibility');
var rename = require('gulp-rename');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var iconfontTemplate = require('gulp-iconfont-template');
var using = require('gulp-using');
var consolidate = require('gulp-consolidate');


// import gulpIf from './../node_modules/gulp-if';
// import gulpLoadPlugins from './../node_modules/gulp-load-plugins';
// import browserSync from './../node_modules/browser-sync';
// import del from './../node_modules/del';
// import runSequence from './../node_modules/run-sequence';
// import access from './../node_modules/gulp-accessibility';
// import rename from './../node_modules/gulp-rename';
// import iconfont from './../node_modules/gulp-iconfont';
// import iconfontCss from './../node_modules/gulp-iconfont-css'
// import using from './../node_modules/gulp-using';
// import consolidate from './../node_modules/gulp-consolidate';


// import imagemin from './../node_modules/gulp-imagemin'
// import pngquant from './../node_modules/imagemin-pngquant'; // $ npm i -D imagemin-pngquant

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const dist = 'dist';
const src = 'src';
const tmp = '.tmp';
const vendor = './../node_modules';


//Convert SVG to font icon
const iconsDist = 'src/icons/dist';

const svgSrc = './src/icons/src/svg/';
const templateSrc = './src/icons/src/template/';
const iconStyleDist = './src/icons/dist/scss';
const fontIconDist = './src/icons/dist/fonts';

const viewIconTemplateDist = './src/icons/dist/';
const viewIconTemplateSrc = './src/icons/src/index.html';

var cfg = {
  sourceDir: './src',
  targetDir: './build',
  distDir: './dist',
  fontName: 'icon-font',
  isVerbose: true
};





gulp.task('iconfont', function () {
  return gulp.src('./src/icons/src/svg/*.svg')
    .pipe(gulpIf(cfg.isVerbose, using()))
    .pipe(iconfontCss({
      fontName: cfg.fontName,
      path: './src/icons/src/template/_iconfont.scss',
      targetPath: '/_' + cfg.fontName + '.scss',
      fontPath: '../../fonts/'
    }))
    .pipe(iconfont({
      fontName: cfg.fontName,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      normalize: true
    }))
    .pipe(gulp.dest('./src/icons/dist/fonts/'));
});

gulp.task('iconfontCopy', () => {
  return gulp.src([
    `${fontIconDist}/**`
  ])
    .pipe(gulp.dest(`${src}/fonts`))
    .pipe($.size({ title: '[iconfontCopy]' }));
});


// Clean output directory
gulp.task('clean', cb => {
  return del([
    `${tmp}`,
    `${dist}`,
    `!${dist}/.git`
  ], { dot: true, force: true });
});

// Copy dist
gulp.task('copy', () => {
  return gulp.src([
    `${tmp}/**/*`,
    `${src}/*`
  ], { dot: true })
    .pipe(gulp.dest(`${dist}`))
    .pipe($.size({ title: '[copy]' }));
});

gulp.task('default', ['clean'], cb => {
  return runSequence(
    'lint',
    ['iconfont'],
    ['iconfontCopy'],
    ['templates', 'styles', 'vendors', 'scripts'],
    ['fonts', 'images', 'minifyCss'],
    'copy',
    cb
  );
});

gulp.task('fonts', () => {
  return gulp.src([
    `${src}/fonts/**`
  ])
    .pipe(gulp.dest(`${dist}/fonts`))
    .pipe($.size({ title: '[fonts]' }));
});




// Optimize images
gulp.task('images', () => {
  return gulp.src([
    `${src}/images/**/*.{svg,png,jpg,gif}`
  ])
    // .pipe($.cache($.imagemin({
    //     progressive: true,
    //     interlaced: true
    // })))
    .pipe(gulp.dest(`${tmp}/images`))
    .pipe($.size({ title: '[images]', showFiles: true }))
});

// Lint JavaScript
gulp.task('lint', () => {
  return gulp.src([
    `${src}/scripts/**/*.js`
  ])
    .pipe($.babel())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
    .pipe($.size({ title: '[lint]' }));
});

gulp.task('minifyCss', () => {
  return gulp.src(`${tmp}/styles/site.css`)
    .pipe($.rename(function (path) {
      path.basename += ".min";
      path.extname = ".css"
    }))
    .pipe($.cssnano())
    .pipe(gulp.dest(`${tmp}/styles`))
    .pipe($.size({ title: '[minifyCss]' }))
});

gulp.task('scripts', () => {
  let scripts = [
    `${src}/scripts/main.js`,
    `${src}/scripts/*/**/*.js`
  ];

  return gulp.src(scripts)
    .pipe($.newer(`${tmp}/scripts`))
    .pipe($.babel())
    .pipe($.concat('scripts.js'))
    .pipe(gulp.dest(`${tmp}/scripts`))
    .pipe($.rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }))
    .pipe($.uglify({ preserveComments: 'some' }))
    .pipe(gulp.dest(`${tmp}/scripts`))
    .pipe($.size({ title: '[scripts]' }));
});

gulp.task('serve', ['templates', 'styles', 'vendors', 'scripts'], () => {

  browserSync({
    notify: false,
    port: 4000,
    server: {
      baseDir: [tmp, src]
    }
  });

  gulp.watch(`${src}/views/**/*.jade`, ['templates']);
  gulp.watch(`${src}/styles/**/*.{scss,sass}`, ['styles']);
  gulp.watch(`${src}/scripts/**/*.js`, ['lint', 'scripts', reload]);
  gulp.watch(`${tmp}/*.html`, reload);
  gulp.watch(`${src}/images/**/*`, reload);

});

gulp.task('serve:dist', ['default'], () => {
  browserSync({
    notify: false,
    port: 3001,
    server: {
      baseDir: [dist]
    }
  });
});

gulp.task('styles', () => {
  return gulp.src(`${src}/styles/site.{scss,sass}`)
    .pipe($.newer(`${tmp}/styles`))
    .pipe($.sourcemaps.init())
    .pipe($.cssGlobbing({
      extensions: ['.scss', '.sass']
    }))
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: ['last 10 version'] }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(`${tmp}/styles`))
    .pipe($.size({ title: '[styles]' }))
    .pipe(reload({ stream: true }));
});

gulp.task('templates', () => {
  return gulp.src(`${src}/views/*.jade`)
    .pipe($.newer(`${tmp}/*.html`))
    .pipe($.sourcemaps.init())
    .pipe($.jade({
      pretty: true
    }))
    .pipe($.plumber())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(`${tmp}`))
    .pipe($.size({ title: '[templates]' }));
});

gulp.task('vendors', () => {
  return gulp.src([
    //`${vendor}/jquery/dist/jquery.js`,
    //`${vendor}/bootstrap/dist/js/bootstrap.js`,
    //`${vendor}/swiper/dist/js/swiper.jquery.js`,
    //`${vendor}/offcanvas-bootstrap/dist/js/bootstrap.offcanvas.js`,
    `${src}/scripts/dashboard-js.js`,
  ])
    .pipe($.newer(`${tmp}/scripts`))
    .pipe($.sourcemaps.init())
    .pipe($.sourcemaps.write())
    .pipe($.concat('scripts.min.js'))
    .pipe($.uglify({ preserveComments: 'some' }))
    .pipe(gulp.dest(`${tmp}/scripts`))
    .pipe($.size({ title: '[vendors]' }));
});

gulp.task('test', function () {
  return gulp.src(`${tmp}/**/template.html`)
    .pipe(access({
      force: true
    }))
    .on('error', console.log)
    .pipe(access.report({ reportType: 'txt' }))
    .pipe(rename({
      extname: '.txt'
    }))
    .pipe(gulp.dest('reports/txt'));
});


gulp.task('distcopy', function () {
  return gulp.src(`${dist}/**`)
    .pipe(gulp.dest('./../public/'))
});
