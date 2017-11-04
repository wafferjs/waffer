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

module.exports = app => {
  const cwd = process.cwd();

  // handle: libs
  app.get(/^.*\/@lib\/(.+)$/, (req, res, next) => {
    res.redirect(path.join('https://unpkg.com', req.params[0]));
  });

  // handle: /view/@file
  app.use(/^(.*)\/@(.+)$/, (req, res, next) => {
    const view = req.params[0] || 'index';
    const file = req.params[1];

    res.redirect(path.join(view, file));
  });

  // redirect: /route -> /route/
  app.get(/^\/[^.]+(?!\/).$/, (req, res) => {
    res.redirect(path.join(req.path, '/'));
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

  // handle: /route/
  app.use(/^.*\/$/, (req, res, next) => {
    require(req.controller)(req, res, next);
  }, (req, res, next) => {
    const { file } = req;

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err) return next(err);
      res.type(ext).send(contentOrBuf);
    }, false, req.session);
  });

  // handle: static files
  app.use(express.static(path.join(cwd, 'static')));

  // handle: file.*
  app.get('*', (req, res, next) => {
    const { file } = req;

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err) return next(err);

      res.type(ext).send(`${contentOrBuf}`);
    }, false, req.session);

  });

}
