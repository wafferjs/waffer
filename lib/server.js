const turbo    = require('turbo-http')
const signale   = require('signale')
const caminte  = require('caminte')
const path = require('path')
const fs = require('fs-extra')
const qs = require('qs')

/**
 * WafferServer class
 * @alias module:waffer
 * @typicalname server
 */
class WafferServer {
  /**
   * Initializes logger
   * Creates server
   * Initializes default parsers
   * Creates database connection
   *
   * @param {Object}  [options.database={}]  Database options (caminte)
   * @param {Object}  [options.logger={}]  Logger options (pino)
   * @param {Boolean} [options.prod=false] Production mode
   * @param {Boolean}  [options.debug=false] Debug mode
   */
  constructor ({ database = {}, logger = {}, prod = false, debug = false } = {}) {
    this.options = { prod, debug }
    this.parsers = {}

    // logger
    signale.config({
      level: prod ? (debug ? 'debug' : 'silent') : (debug ? 'debug' : 'info'),
      ...logger,
    })

    this.log = signale

    // server
    this.http = turbo.createServer(require('./router')(this))

    // parsers
    this.register_parser('.pug', require('waffer-parser-pug')(this))
    this.register_parser('.styl', require('waffer-parser-stylus')(this))
    this.register_parser('.html', require('waffer-parser-html')(this))

    // database
    this.schema = new caminte.Schema(database.adapter || 'memory', database)
    this.models()
  }

  /**
   * Initializes all models
   * If `debug` flag has been passed then watches files for changes to update schemas
   *
   * @return {Object} Server instance
   */
  async models () {
    const dir = path.join(process.cwd(), 'models')
    const model_files = await fs.readdir(dir)

    const models = []

    for (const file of model_files) {
      const { name } = path.parse(file)
      const model = require(path.join(dir, file))(this.schema)

      if (model != null) {
        models.push([ name, model ])
      }
    }

    for (const data of models) {
      const [ name, model ] = data

      global[name] = model()
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
   * Parse POST data
   *
   * @param  {request} req Request
   *
   * @return {object} POST data
   */
  async _post_body (req) {
    // eslint-disable-next-line compat/compat
    return new Promise((resolve, reject) => {
      let data = ''

      req.ondata = (buf, start, len) => {
        data += buf.toString('utf-8').slice(start, start + len)

        if (data.length > 1e6) {
          return reject(new Error(413))
        }
      }

      req.onend = () => {
        const type = req.getHeader('content-type')

        if (type.match(/urlencoded/)) {
          resolve(qs.parse(data))
        } else if (type.match(/json/)) {
          resolve(JSON.parse(data))
        }

        // TODO: Add ocet-stream
        // TODO: Add multipart

        reject(new Error(400))
      }
    })
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
