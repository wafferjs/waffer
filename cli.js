#!/usr/bin/node

const Mongo     = require('./database/mongo');
const Database  = require('./database');
const parser    = require('./parser');
const fs        = require('fs-extra');
const optimist  = require('optimist');
const rimraf    = require('rimraf');
const colors    = require('colors');
const path      = require('path');
const glob      = require('glob');
const waffer    = require('./');

const { argv } = optimist;

const cwd = process.cwd();

if (argv._[0] === 'init') {
  const dir = argv._.length < 2 ? '.' : argv._[1];

  const src = path.join(__dirname, 'template');
  const dest = path.join(cwd, dir);
  fs.copySync(src, dest, { filter: (src, dest) => {
    console.log('[+] '.green + dest.slice(cwd.length));
    return true;
  } });
  console.log('New waffer project initialized');
  return;
}

if (!fs.existsSync(path.join(cwd, 'views'))) {
  console.error('[!] '.red + 'Not a valid waffer project.');
  return;
}

if (argv._[0] === 'view') {
  if (argv._.length < 2) {
    console.error('[!] '.red + 'Not a valid view name');
    return;
  }

  const dir = argv._[1];

  const src = path.join(__dirname, 'template/views/index');
  const dest = path.join(cwd, 'views', dir);
  fs.copySync(src, dest, { filter: (src, dest) => {
    console.log('[+] '.green + dest.slice(cwd.length));
    return true;
  } });

  console.log('View ' + dir.green + ' created.');
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
      console.log('[+] '.green + p);
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
        console.log('[+] '.green + d.join('.'));
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
        const file = path.join(cwd, 'html', view + ext);
        fs.writeFileSync(file, contentOrBuf);
        console.log('[+] '.green + file);
      }
    }, true);

    // make script dir
    const dest = path.join(cwd, 'html', view);
    const public = glob.sync(dir + '/**').filter(f => !f.endsWith('.pug'));

    if (public.length > 0) {
      fs.ensureDirSync(dest);
      console.log('[+] '.green + dest);
    }

    // public files
    for (let s of public) {
      const p = path.join(dest, s.substring(dir.length));

      if (fs.statSync(s).isDirectory()) {
        fs.ensureDirSync(p);
        console.log('[+] '.green + p);
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
          console.log('[+] '.green + d.join('.'));
        }
      }, true);
    }
    console.log('Project exported into html/');
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
