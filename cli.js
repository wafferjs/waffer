#!/usr/bin/node

const Mongo     = require('./database/mongo');
const Database  = require('./database');
const parser    = require('./parser');
const server    = require('./server');
const fs        = require('fs-extra');
const optimist  = require('optimist');
const parse5    = require('parse5');
const rimraf    = require('rimraf');
const path      = require('path');
const glob      = require('glob');

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
    rimraf.sync('html');
  } catch (e) {}

  fs.mkdirSync('html');

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
        const document = parse5.parse(contentOrBuf, { locationInfo: false });

        const dfs = function (root) {
          try {
            for (let child of root.childNodes) {
              if (child.tagName === 'script') {
                for (let attr of child.attrs) {
                  if (attr.name === 'src') {
                    if (attr.value[0] === '@') {
                      attr.value = path.join(view, attr.value.substr(1));
                      continue;
                    }

                    attr.value = attr.value.replace('lib/', 'https://unpkg.com/');
                  }
                }
              }

              if (child.tagName === 'link') {
                for (let attr of child.attrs) {
                  if (attr.name === 'href') {
                    if (attr.value[0] === '@') {
                      attr.value = path.join(view, attr.value.substr(1)).replace(/\.(?!css).+$/, '.css');
                      continue;
                    }

                    attr.value = attr.value.replace('lib/', 'https://unpkg.com/').replace(/\.(?!css).+$/, '.css');
                  }
                }
              }

              if (child.tagName === 'a') {
                for (let attr of child.attrs) {
                  if (attr.name === 'href') {
                    attr.value = attr.value.replace(/^\/([^/]+)\/$/, '$1.html');
                  }
                }
              }
              dfs(child);
            }
          } catch (e) {}
        };

        dfs(document);

        fs.writeFileSync(path.join(cwd, 'html', view + ext), parse5.serialize(document));
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

server.listen();
