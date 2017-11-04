const parser  = require('./parser');
const express = require('express');
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

const cache = {
  __duration: 60 * 1000,
};

module.exports = app => {
  const cwd = process.cwd();

  // handle: libs
  app.get(/^.*unpkg:(.+)$/, (req, res, next) => {
    res.redirect(path.join('https://unpkg.com', req.params[0]));
  });

  // add: { file, controller } to req
  app.use((req, res, next) => {
    const ppath = path.parse(req.path);

    let dir = req.path;
    if (ppath.dir === '/' && !(req.path.endsWith('/') && req.path.split('/').length === 3)) {
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


  // handle: /view/@file
  app.use(/^(.*)\/@(.+)$/, (req, res, next) => {
    const view = req.params[0] || 'index';
    const file = req.params[1];

    res.redirect(path.join(view, file));
  });

  // handle: /route/
  app.use(/^.*\/$/, (req, res, next) => {
    require(req.controller)(req, res, next);
  }, (req, res) => {
    const { file } = req;
    const html = pug.renderFile(file, { sess: req.session });
    res.type('.html').send(html);
  });

  // redirect: /route -> /route/
  app.get(/^\/[^.]*$/, (req, res) => {
    res.redirect(path.join(req.path, '/'));
  });

  // handle: file.*
  app.get('*', (req, res, next) => {
    const { file } = req;

    const data = cache[file];
    if (data && +new Date - cache.__duration < data.timestamp) {
      console.log('cached!');
      return res.type(data.ext).send(data.body);
    }

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err) return next(err);

      if (contentOrBuf) {
        cache[file] = { ext, body: contentOrBuf, timestamp: +new Date };
      }
      res.type(ext).send(`${contentOrBuf}`);
    });

  });

  // handle: static files
  app.use(express.static(path.join(cwd, 'static')));

}
