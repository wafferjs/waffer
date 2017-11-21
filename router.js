const mime    = require('mime/lite');
const parser  = require('./parser');
const stylus  = require('stylus');
const utilus  = require('utilus');
const path    = require('path');
const pug     = require('pug');
const nib     = require('nib');
const fs      = require('fs');

/**
 * server structure:
 *
 * ├─ bower_components/
 * ├─ static/
 * ├─ styles/
 * │  ├─ variables.styl
 * │  └─ reset.styl
 * │
 * └─ views/
 *    ├─ index/
 *    │  ├─ controller/
 *    │  │  └─ index.js
 *    │  │
 *    │  └ public/
 *    │     ├─ index.js
 *    │     ├─ index.pug
 *    │     └─ index.styl
 *    │
 *    └─ view/
 *       ├─ subview/                // TODO:
 *       │  ├─ index.js             // Check controller support in subviews
 *       │  ├─ index.pug
 *       │  └─ index.styl
 *       │
 *       ├─ controller/
 *       │  └─ index.js
 *       │
 *       └ public/
 *          ├─ index.js
 *          ├─ index.pug
 *          └─ index.styl
 */

module.exports = app => {
  const cwd = process.cwd();

  // handle: /:view/@:file
  // handle: @lib/:file
  app.use((req, res, next) => {
    if (req.file) return next();
    let view = '';
    let file = '';

    const index = req.url.indexOf('@');
    if (~index) {
      const split = req.url.split('@');

      if (split[1].startsWith('lib/')) {
        req.file = 'https://unpkg.com/' + split.slice(1).join('@').replace('lib/', '');
        req.redirect = true;

        return next();
      }

      view = split.shift() || '/';
      file = split.join('@');

      req.file = path.join(cwd, 'views', view === '/' ? 'index' : view, 'public', file === '' ? 'index.pug' : file);
      return next();
    }

    if (req.url.match(/\/[^.]+(?!\/).$/)) {
      req.redirect = true;
      req.file = req.url + '/';

      return next();
    }

    next();
  });

  // add: { file, controller } to req
  app.use((req, res, next) => {
    if (req.file) return next();
    const ppath = path.parse(req.url);

    let dir = req.url;
    if (ppath.dir === '/' && !(req.url.endsWith('/') && req.url.split('/').length === 3)) {
      ppath.dir = dir = '/index';
    }

    if (ppath.ext === '') {
      req.controller = path.join(cwd, 'views', dir, 'controller');
      req.file = path.join(cwd, 'views', dir, 'public/index.pug');
    } else {
      req.file = path.join(cwd, 'views', ppath.dir, 'public', ppath.base);
    }

    next();
  });

  // handle: /route/
  app.use('^.*\/$', (req, res, next) => {
    require(req.controller)(req, res, next);
  }, (req, res, next) => {
    const { file } = req;

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err) return next(err);
      res.type(mime.getType(ext)).send(contentOrBuf);
    }, false, req.session);
  });

  app.get('/static/*', (req, res) => {
    const file = path.join(cwd, 'static', req.params['*']);

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err)  {
        switch (err.code) {
          case 'ENOENT':
            res.code(404).send({ success: false, message: 'Not found' });
            break;
          default:
            res.code(500).send(err);
        }

        return;
      }

      res.type(mime.getType(ext)).send(contentOrBuf);
    }, false, req.session);
  });

  // handle: file.*
  app.get('*', (req, res) => {
    const { file, redirect } = req.req;

    console.log(file, redirect)

    if (redirect === true) {
      return res.redirect(file);
    }

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err)  {
        switch (err.code) {
          case 'ENOENT':
            if (!~file.indexOf('static')) {
              const slice = file.slice(cwd.length + 7).split('/public/').join('/');
              req.req.file = path.join(cwd, 'static', slice);
              res.redirect(path.join('/static', slice));

              return;
            }

            res.code(404).send({ success: false, message: 'Not found' });
            break;
          default:
            res.code(500).send(err);
        }

        return;
      }

      res.type(mime.getType(ext)).send(contentOrBuf);
    }, false, req.session);

  });

}
