#!/usr/bin/node

const Mongo     = require('./database/mongo');
const Database  = require('./database');
const parser    = require('./parser');
const fs        = require('fs-extra');
const optimist  = require('optimist');
const rimraf    = require('rimraf');
const path      = require('path');
const glob      = require('glob');
const waffer    = require('./');

const { argv } = optimist;

const cwd = process.cwd();

if (argv._[0] === 'init') {
  const dir = argv._.length < 2 ? '.' : argv._[1];

  const src = path.join(__dirname, 'template');
  const dest = path.join(cwd, dir);
  fs.copySync(src, dest);
  console.log('new waffer project initialized');
  return;
}

if (!fs.existsSync(path.join(cwd, 'views'))) {
  console.error('error: not a valid waffer project');
  return;
}

if (argv._[0] === 'export') {
  const views = fs.readdirSync(path.join(cwd, 'views'));
  views.unshift(views.splice(views.indexOf('index'), 1)[0]);

  try {
    rimraf.sync(argv._[1] || 'html');
  } catch (e) {}

  fs.mkdirSync(argv._[1] || 'html');

  // static files and styles
  const static = path.join(cwd, 'static');
  const styles = path.join(cwd, 'styles');
  for (let s of glob.sync(`{${static}/**,${styles}/**}`, { dot: true })) {
    const p = path.join(cwd, 'html', s.substring(static.length));

    if (fs.statSync(s).isDirectory()) {
      fs.ensureDirSync(p);
      continue;
    }

    parser.parse(s, (err, contentOrBuf, ext) => {
      if (err) {
        console.error(err);
      }

      if (contentOrBuf) {
        let d = p.split('.');
        d.pop();
        d.push(ext.substr(1));
        fs.writeFileSync(d.join('.'), contentOrBuf);
      }
    }, true);
  }

  for (let view of views) {
    const dir = path.join(cwd, 'views', view, 'public');

    // index of view
    const index = path.join(dir, 'index.pug');
    parser.parse(index, (err, contentOrBuf, ext) => {
      if (err && !~`${err}`.indexOf('no such file')) {
        console.error(err);
      }

      if (contentOrBuf) {
        fs.writeFileSync(path.join(cwd, 'html', view + ext), contentOrBuf);
      }
    }, true);

    // make script dir
    const dest = path.join(cwd, 'html', view);
    const public = glob.sync(dir + '/**').filter(f => !f.endsWith('.pug'));

    if (public.length > 0) {
      fs.ensureDirSync(dest);
    }

    // public files
    for (let s of public) {
      const p = path.join(dest, s.substring(dir.length));

      if (fs.statSync(s).isDirectory()) {
        fs.ensureDirSync(p);
        continue;
      }

      parser.parse(s, (err, contentOrBuf, ext) => {
        if (err) {
          console.error(err);
        }

        if (contentOrBuf) {
          let d = p.split('.');
          d.pop();
          d.push(ext.substr(1));
          fs.writeFileSync(d.join('.'), contentOrBuf);
        }
      }, true);
    }
  }


  return;
}

if (argv._[0] === 'serve') {
  waffer().listen();
  return;
}

console.log('waffer init [<dir>]          # initialize waffer project');
console.log('waffer serve [--port <port>] # simple serve');
console.log('waffer export                # export all views into simple html site');
console.log('waffer help                  # display help');
