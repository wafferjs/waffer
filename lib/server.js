const router   = require('./router')
const fastify  = require('fastify')
const pino     = require('pino')
const caminte  = require('caminte')

const tmp = require('tmp').dirSync()

/**
 * WafferServer class
 */
class WafferServer {
  /**
   * Initializes logger
   * Creates fastify server
   * Initializes default parsers
   * Creates database connection
   *
   * @method constructor
   *
   * @param {Object}  [logger={}]  Logger options (pino)
   * @param {Boolean} [prod=false] Production mode
   * @param {Boolean}  [debug=false] Debug mode
   */
  constructor ({ logger = {}, prod = false, debug = false } = {}) {
    this.options = { logger, prod, debug }
    this.parsers = {}
    this.tmp = tmp

    // logger
    const pretty = pino.pretty()
    pretty.pipe(process.stdout)

    this.app = fastify({
      logger: pino({
        level: prod ? (debug ? 'debug' : 'silent') : (debug ? 'debug' : 'info'),
        ...logger,
      }, pretty),
    })

    // export logger to class context
    this.log = this.app.log

    // parsers
    this.register_parser('.pug', require('waffer-parser-pug')(this))
    this.register_parser('.styl', require('waffer-parser-stylus')(this))
    this.register_parser('.html', require('waffer-parser-html')(this))

    // log tmp dir
    this.log.debug({}, 'tmp dir: ' + tmp.name)

    // database
    this.schema = new caminte.Schema()
  }

  /**
   * Initializes all models
   * If `debug` flag has been passed then watches files for changes to update schemas
   *
   * @method models
   *
   * @return {WafferServer} Server instance
   */
  models () {
    const models = []

    // get all models
    for (const model of models) {

    }
  }

  /**
    * Registers parser
    *
    * @method parser
    *
    * @param  {string} ext Patser extension
    * @param  {WafferParser} parser Parser Function
    *
    * @return {WafferServer} Returns server instance
    */
  register_parser (ext, parser) {
    const proper_ext = '.' + ext.split('.').slice(-1)[0]
    this.parsers[proper_ext] = parser
    return this
  }

  /**
    * Returns one for given extension
    *
    * @method parser
    *
    * @param  {string} ext Patser extension
    *
    * @return {WafferParser} Returns parser
    */
  parser (ext) {
    const proper_ext = '.' + ext.split('.').slice(-1)[0]
    return this.parsers[proper_ext] || require('waffer-parser-default')(this)
  }

  /**
   * Listens for connection
   *
   * @method listen
   *
   * @param  {Number} [port=0] App port
   *
   * @return {WafferServer}    Returns WafferServer instance
   */
  listen (port = 0) {
    // create routes
    router(this)

    // start server
    this.app.listen(port)

    return this
  }
}

module.exports = WafferServer
