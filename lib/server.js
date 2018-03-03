const router   = require('./router');
const fastify  = require('fastify');
const path     = require('path');
const pino     = require('pino');

const tmp = require('tmp').dirSync();

class WafferServer {
  constructor({ logger = {}, prod = false, debug = false } = {}) {
    this.options = { logger, prod, debug };
    this.parsers = {};
    this.tmp = tmp;

    // logger
    const pretty = pino.pretty()
    pretty.pipe(process.stdout)


    this.app = fastify({
      logger: pino({
        level: prod ? (debug ? 'debug' : 'silent') : (debug ? 'debug' : 'info'),
       ...logger,
      }, pretty),
    });

    // export logger to class context
    this.log = this.app.log;

    // parsers
    this.parser('.styl', require('../../waffer-parser-stylus')(this))
    this.parser('.pug',  require('../../waffer-parser-pug')(this))
    this.parser('.html',  require('../../waffer-parser-html')(this))

    // log tmp dir
    this.log.debug({}, 'tmp dir: ' + tmp.name)
  }

  parser(extOrFile, parser) {
    if (parser) {
      this.parsers[extOrFile] = parser;
      return this;
    }

    const ext = '.' + extOrFile.split('.').slice(-1)[0];
    return this.parsers[ext] || require('../../waffer-parser-default')(this);
  }

  listen(port = 0) {

    // create routes
    router(this);

    // start server
    this.app.listen(port);

    return this;
  }
}

module.exports = WafferServer;
