const Server    = require('./lib/server');

module.exports = function (options) {
  return new Server(options);
};
