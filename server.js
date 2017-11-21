const helmet   = require('fastify-helmet');
const compress = require('compression');
const router   = require('./router');
const optimist = require('optimist');
const fastify  = require('fastify');
const morgan   = require('morgan');
const path     = require('path');

const { argv } = optimist;

class WafferServer {
  constructor({ session = {} } = {}) {
    this.app = fastify();

    this.app.register(helmet);

    // compression
    this.app.use(compress());

    // logger
    this.app.use(morgan('dev'));

    const { secret, cookieName, cookie, store } = session;
    if (secret || cookieName || cookie || store) {
      this.app.register(require('fastify-cookie'));
      this.app.register(require('fastify-session', {
        secret: secret || 'i like waffles',
        cookieName, cookie, store,
      }));
    }
  }

  listen(port = argv.port) {

    // create routes
    router(this.app);

    this.app.listen(port || 0, () => {
      console.log(`listening on ${this.app.server.address().port}`);
    });

    return this;
  }
}

module.exports = WafferServer;
