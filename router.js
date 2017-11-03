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
  }, (req, res) => {
    const { file } = req;
    const html = pug.renderFile(file, { sess: req.session });
    res.type('.html').send(html);
  });

  // handle: file.pug
  app.get('/**/*.pug', (req, res) => {
    const { file } = req;

    parser.parse(file, (err, content) => {
      if (err) return next(err);
      res.type('.html').send(content);
    });
  });

  // handle: file.styl
  app.get('**/*.styl', (req, res, next) => {
    const { file } = req;

    parser.parse(file, (err, content) => {
      if (err) return next(err);
      res.type('.css').send(content);
    });
  });

  // handle: file.js
  app.get('**/*.js', (req, res, next) => {
    const { file } = req;

    parser.parse(file, (err, content) => {
      if (err) return next(err);
      res.type('.js').send(content);
    });

  });

  // redirect: /route -> /route/
  app.get(/^\/[^.]*$/, (req, res) => {
    res.redirect(path.join(req.path, '/'));
  });

  // handle: bower libs
  app.get('/libs/:lib.js', (req, res, next) => {
    const { lib } = req.params;
    const component = path.join(cwd, 'bower_components', lib);
    const package = require(path.join(component, 'package.json'));

    const main = package.unpkg || package.browser || package.main;

    parser.parse(path.join(component, main), (err, content) => {
      if (err) return next(err);
      res.type('.js').send(content);
    });
  });

  // TODO:
  // handle: bower lib files
  app.get('/libs/:lib/:file', (req, res) => {
    const { lib, file } = req.params;
    const component = path.join(cwd, 'bower_components', lib);
    const package = require(path.join(component, 'package.json'));
  });

  // TODO:
  // handle: file.es
  app.get('**/*.es', (req, res) => {
    // add webpack support
  });

  // handle: static files
  app.use(express.static(path.join(cwd, 'static')));
}
