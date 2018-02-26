const router   = require('./router');
const fastify  = require('fastify');
const path     = require('path');
const pino     = require('pino');

const tmp = require('tmp').dirSync();

class WafferServer {
  constructor({ logger = {}, prod = false, debug = false } = {}) {
    this.options = { logger, prod, debug }
    this.parsers = {}

    // logger
    const pretty = pino.pretty()
    pretty.pipe(process.stdout)

    
    this.app = fastify(Object.assign({
      level: prod ? (debug ? 'debug' : 'silent') : (debug ? 'debug' : 'info'),
    }, logger));

    // export logger to class context
    this.log = this.app.log;

    // parsers
    this.parser('.styl', require('waffer-parser-stylus'))
    this.parser('.pug',  require('waffer-parser-pug'))

    // log tmp dir
    this.log.debug({}, 'tmp dir: ' + tmp.name)
  }

  parser(extOrFile, parser) {
    if (parser) {
      this.parsers[extOrFile] = parser;
      return this;
    }

    const ext = '.' + extOrFile.split('.').slice(-1)[0];
    const parsingFunc = this.parsers[ext] || require('waffer-parser-default');

    return parsingFunc(this)
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
