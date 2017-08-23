const fs = require('fs');
const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const concat_css = require('gulp-concat-css');
const concat_js = require('gulp-concat');
const minify_css = require('gulp-cssnano');
const less = require('gulp-less');
const jshint = require('gulp-jshint');
const git = require('gulp-git');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const minify_js = require("gulp-uglify");
const duration = require('gulp-duration');
const mkdirp = require('mkdirp');
const jsdoc = require('gulp-jsdoc');
const adminlteRoot = 'node_modules/admin-lte/';
const cleancss = new LessPluginCleanCSS({ advanced: true });
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const filesExist = require('files-exist');
//
const browserify = require('browserify');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const collapse = require('bundle-collapser/plugin');
const tsify = require('tsify');

const usageCmd = '\nUsage: gulp build|release|docs|install [--local] [--dest]\n \
\t--local\tUse fake data instead of retrieving them from the server.\n \
\t--dest\tSet the destination folder for the install task.\n\
\tbuild\tSimply build the project.\n\
\trelease\tBuild the project with minify and uglify.\n\
\tdocs\tBuild the javascript documentation.\n\
\tinstall\tBuild the project and then copy all the files to the folder specified with --dest.\n\
';

const argv = require('yargs')
    .usage(usageCmd)
    .argv;

const cssSources = ["node_modules/ionicons/dist/css/ionicons.css",
    "node_modules/font-awesome/css/font-awesome.css",
    "node_modules/codemirror/lib/codemirror.css",
    "node_modules/codemirror/addon/lint/lint.css",
    "node_modules/bootstrap/dist/css/bootstrap.css",
    "node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css",
    "node_modules/bootstrap-daterangepicker/daterangepicker.css",
    "node_modules/nvd3/build/nv.d3.css",
    "node_modules/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.css",
    "lib/Styles/*.css"
];

const scssSources = ["app/assets/scss/src/**/*.scss"];

const localJSSources = [];

const browserEntries = [
    './app/app.js',
    argv.local ? "./app/components/configuration/conf_debug.js" :
    "./app/components/configuration/conf.js"
];

const lintSources = browserEntries.concat([
    'app/components/**/*.js'
]);

const externalJSSources = ['node_modules/moment/moment.js',
    'node_modules/moment-timezone/builds/moment-timezone-with-data.js',
    'node_modules/lodash/lodash.js',
    'node_modules/jquery/dist/jquery.js',
    'node_modules/datatables.net/js/jquery.dataTables.js',
    'node_modules/jshint/dist/jshint.js',
    'node_modules/codemirror/lib/codemirror.js',
    'node_modules/codemirror/mode/javascript/javascript.js',
    'node_modules/codemirror/mode/xml/xml.js',
    //'node_modules/codemirror/addon/hint/show-hint.js',
    'node_modules/codemirror/addon/edit/matchbrackets.js',
    'node_modules/codemirror/addon/edit/closebrackets.js',
    'node_modules/codemirror/addon/lint/lint.js',
    'node_modules/jsonlint/lib/jsonlint.js',
    'node_modules/codemirror/addon/lint/javascript-lint.js',
    'node_modules/codemirror/addon/lint/json-lint.js',
    'node_modules/codemirror/addon/lint/html-lint.js',
    'node_modules/angular/angular.js',
    'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
    'node_modules/angular-resource/angular-resource.js',
    'node_modules/angular-datatables/dist/angular-datatables.js',
    'node_modules/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'node_modules/bootstrap-daterangepicker/daterangepicker.js',
    'node_modules/angular-daterangepicker/js/angular-daterangepicker.js',
    'node_modules/d3/d3.js',
    'node_modules/nvd3/build/nv.d3.js',
    'node_modules/angular-nvd3/dist/angular-nvd3.js',
    'node_modules/fastclick/lib/fastclick.js',
    'node_modules/angular-screenfull/dist/angular-screenfull.js',
    'node_modules/screenfull/dist/screenfull.js'
    //'node_modules/three/build/three.js'
    //'node_modules/angular-ui-codemirror/src/ui-codemirror.js'
];

const jsSources = externalJSSources.concat(localJSSources);

mkdirp('docs');
mkdirp('wwwroot/build/fonts');
mkdirp('wwwroot/build/js');
mkdirp('wwwroot/build/css');
mkdirp('wwwroot/build/html');
mkdirp('wwwroot/build/img');

gulp.task('default', function() {
    console.log(usageCmd);
});

gulp.task('installdebug', gulpSequence('build', 'copy-files'));

gulp.task('install', gulpSequence('release', 'copy-files'));

gulp.task('build', ['common', 'prepare-css', 'prepare-js', 'browser-js']);

gulp.task('release', ['common', 'prepare-css-release',
    'prepare-js-release', 'browser-js-release',
    'extract-git-revision'
]);

gulp.task('common', [ /*'lint'*/ 'prepare-assets', 'prepare-html']);

gulp.task('docs', function() {
    return gulp.src(localJSSources.concat(['README.md']))
        .pipe(jsdoc('./docs'));
});

gulp.task('lint', function() {
    return gulp.src(lintSources)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('prepare-html', function() {
  return gulp.src([
      "app/components/dashboard/*.html",
      "app/components/monitoring/*.html",
      "app/components/topbar/*.html",
      "app/components/settings/**/*.html",
      "app/components/widgets/*.html",
      "app/components/widgets/**/*.html"
    ])
    .pipe(duration('Execution Time: '))
    .pipe(gulp.dest('wwwroot/build/html/'));
});

gulp.task('prepare-assets', function() {
  return gulp.src([
      "node_modules/ionicons/dist/fonts/ionicons*",
      "node_modules/bootstrap/dist/fonts/glyphicons*",
      "node_modules/font-awesome/fonts/fontawesome*"
    ])
    .pipe(duration('Execution Time: '))
    .pipe(gulp.dest('wwwroot/build/fonts/'));
});

function buildCSS(cssFiles, scssFiles, minify) {

    // Compile scss sources first
    gulp.src(scssFiles)
        .pipe(sass().on('error', sass.logError))
        .pipe(rename("compiled_main.css"))
        .pipe(gulp.dest('app/assets/scss/build'))
        .pipe(duration('Execution Time: '));

    // Merge with external css sources
    var sources = cssFiles.concat(["app/assets/scss/build/compiled_main.css"]);
    var g = gulp.src(sources)
        .pipe(concat_css('style.min.css', { rebaseUrls: false }));
    if (minify) {
        g = g.pipe(minify_css({ zindex: false }));
    }

    return g.pipe(duration('Execution Time: '))
        .pipe(gulp.dest('wwwroot/build/css/'));
}

function buildJS(files, destName, destDir, minify) {
    var g = gulp.src(filesExist(files))
        .pipe(concat_js(destName));
    if (minify) {
        g = g.pipe(minify_js());
    }
    return g.pipe(duration('Execution Time: '))
        .pipe(gulp.dest(destDir));
}

function buildBrowser(main, name, dst, minify) {
    var g = browserify({ entries: main, extensions: ['.js', '.ts'], debug: false })
        .plugin(tsify, { noImplicitAny: true, target: "es5" })
        .plugin(collapse)
        .bundle()
        .on('error', function(err) {
            console.error(err);
        })
        .pipe(source(name))
        .pipe(buffer());

    if (minify) {
        g = g.pipe(minify_js());
    } else {
        g = g.pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'));
    }

    return g.pipe(gulp.dest(dst));
}

gulp.task('prepare-js', function() {
    return buildJS(jsSources, 'lib.min.js', 'wwwroot/build/js/', false);
});

gulp.task('prepare-js-release', function() {
    return buildJS(jsSources, 'lib.min.js', 'wwwroot/build/js/', true);
});

gulp.task('browser-js', function() {
    return buildBrowser(browserEntries, 'fca.min.js', 'wwwroot/build/js/', false);
});

gulp.task('browser-js-release', function() {
    return buildBrowser(browserEntries, 'fca.min.js', 'wwwroot/build/js/', true);
});

gulp.task('prepare-css', function() {
    return buildCSS(cssSources, scssSources, false);
});

gulp.task('prepare-css-release', function() {
    return buildCSS(cssSources, scssSources, true);
});

gulp.task('extract-git-revision', function() {
    function errFnct(err) {
        console.error("Unable to get git revision, reason: " + err);
    }

    function fillRevision(revision) {
        fs.writeFile("wwwroot/ClientVersion.json", '{"ClientRevision" : "' + revision + '" }', function(err) {
            if (err) return errFnct(err);

            console.log("Building revision : " + revision);
        });
    }

    git.status({ args: '--porcelain' }, function(err, changeList) {
        if (changeList)
            fillRevision("unknown");
        else
            git.exec({ args: 'log -n 1 --format=%H' }, function(err, revision) {
                if (err) return errFnct(err);
                fillRevision(revision.trim());
            });
    });
});

gulp.task('copy-files', function() {
    if (!argv.dest)
        throw "Missing destination path; use --dest parameter to indicate the destination folder";

    return gulp.src("wwwroot/**/*")
        .pipe(gulp.dest(argv.dest));
});
