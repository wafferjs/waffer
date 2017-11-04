const compress = require('compression');
const parser   = require('body-parser');
const optimist = require('optimist');
const router   = require('./router');
const express  = require('express');
const morgan   = require('morgan');

const { argv } = optimist;

class WafferServer {
  constructor(options = {}) {
    this.app = express();
    this.http = require(options.server || 'http').Server(this.app);

    // compression
    this.app.use(compress());

    // logger
    this.app.use(morgan('dev'));

    // parse json
    this.app.use(parser.json());
    this.app.use(parser.urlencoded({ extended: true }));
  }

  listen(port = argv.port) {

    // create routes
    router(this.app);

    const listener = this.http.listen(port || 0, () => {
      console.log(`listening on ${listener.address().port}`);
    });

    return this;
  }
}

module.exports = WafferServer;
