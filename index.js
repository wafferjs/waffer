const Server    = require('./lib/server')

/**
 * Waffer module
 *
 * @module waffer
 */

module.exports = function (options) {
  return new Server(options)
}
