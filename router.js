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
 * ├─ static/
 * │  └─ reset.styl
 * │
 * ├─ styles/
 * │  └─ variables.styl
 * │
 * ├─ controllers/
 * │  ├─ index/
 * │  │  └─ index.js
 * │  └─ view/
 * │     └─ index.js
 * │
 * └─ views/
 *    ├─ index/
 *    │  ├─ styles
 *    │  │  └─ *.styl
 *    │  ├─ scripts
 *    │  │  └─ *.js
 *    │  └─ index.pug
 *    │
 *    └─ view/
 *       ├─ styles
 *       │  └─ *.styl
 *       ├─ scripts
 *       │  └─ *.js
 *       └─ index.pug
 */

module.exports = app => {
  const cwd = process.cwd();

  // handle: /:view/@:file
  // handle: @lib/:file
  app.addHook('preHandler', (request, reply, next) => {
    let url = request.params['*'];

    const at = url.split('@');
    if (at.length > 1) {

      if (at[1].startsWith('lib/')) {
        return reply.redirect('https://unpkg.com/' + at.slice(1).join('@').replace('lib/', ''));
      }

      const view = at.shift() || '/';
      const file = at.join('@');

      request.file = path.join(cwd, 'views', view === '/' ? 'index' : view, file === '' ? 'index.pug' : file);
      return next();
    }

    const parsed_url = path.parse(url);

    if (parsed_url.ext === '' && url.slice(-1) !== '/') {
      url += '/';
      return reply.redirect(url);
    }

    if (parsed_url.ext === '') {
      // handle ^*./$ routes
      const view = url === '/' ? 'index' : url;
      const controller = path.join(cwd, 'controllers', view);

      request.file = path.join(cwd, 'views', view, 'index.pug');

      try {
        return require(controller)(request, reply, next);
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          return reply.code(404).send({ success: false, message: 'View not found' });
        }

        return reply.code(500).send({ success: false, message: err.message});
      }

    }

    // add: { file, controller } to req
    request.file = path.join(cwd, 'static', url);

    next();
  });

  /*
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
  */

  // handle: file.*
  app.get('*', (request, res) => {
    const { file } = request;

    parser.parse(file, (err, contentOrBuf, ext) => {
      if (err)  {
        switch (err.code) {
          case 'ENOENT':
            res.code(404).send({ success: false, message: 'Not found' });
            break;
          default:
            err.success = false;
            res.code(500).send(err);
        }

        return;
      }

      res.type(mime.getType(ext)).send(contentOrBuf);
    }, false, request.session);

  });

}
