const router   = require('./router')
const turbo    = require('turbo-http')
const pino     = require('pino')
const caminte  = require('caminte')

const tmp = require('tmp').dirSync()

/**
 * WafferServer class
 * @alias module:waffer
 * @typicalname server
 */
class WafferServer {
  /**
   * Initializes logger
   * Creates fastify server
   * Initializes default parsers
   * Creates database connection
   *
   * @param {Object}  [options.database={}]  Database options (caminte)
   * @param {Object}  [options.logger={}]  Logger options (pino)
   * @param {Boolean} [options.prod=false] Production mode
   * @param {Boolean}  [options.debug=false] Debug mode
   */
  constructor ({ database = {}, logger = {}, prod = false, debug = false } = {}) {
    this.options = { logger, prod, debug }
    this.parsers = {}
    this.tmp = tmp

    // logger
    const pretty = pino.pretty()
    pretty.pipe(process.stdout)
    this.log = pino({
      level: prod ? (debug ? 'debug' : 'silent') : (debug ? 'debug' : 'info'),
      ...logger,
    }, pretty)

    // server
    this.http = turbo.createServer(require('./router')(this))

    // parsers
    this.register_parser('.pug', require('../../waffer-parser-pug')(this))
    this.register_parser('.styl', require('waffer-parser-stylus')(this))
    this.register_parser('.html', require('waffer-parser-html')(this))

    // log tmp dir
    this.log.debug({}, 'tmp dir: ' + tmp.name)

    // database
    if (database.adapter) {
      this.schema = new caminte.Schema(database.adapter, database)
    }
  }

  /**
   * Initializes all models
   * If `debug` flag has been passed then watches files for changes to update schemas
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
    * @param  {string} ext Patser extension
    * @param  {function} parser Parser Function
    *
    * @return {WafferServer} Returns server instance
    */
  register_parser (ext, parser) {
    const proper_ext = '.' + ext.split('.').slice(-1)[0]
    this.parsers[proper_ext] = parser
    return this
  }

  /**
    * Returns a parser for given extension
    *
    * @param  {string} ext Patser extension
    *
    * @return {function} Returns parser
    */
  parser (ext) {
    const proper_ext = '.' + ext.split('.').slice(-1)[0]
    return this.parsers[proper_ext] || require('waffer-parser-default')(this)
  }

  /**
   * Listens for connection
   *
   * @param  {Number} [port=0] App port
   *
   * @return {WafferServer}    Returns WafferServer instance
   */
  listen (port = 0) {
    // start server
    this.http.listen(port)

    return this
  }
}

module.exports = WafferServer
