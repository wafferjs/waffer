const compress = require('compression');
const parser   = require('body-parser');
const optimist = require('optimist');
const router   = require('./router');
const express  = require('express');
const morgan   = require('morgan');

const { argv } = optimist;

class WafferServer {
  constructor() {
    this.app = express();

    // compression
    this.app.use(compress());

    // logger
    this.app.use(morgan('dev'));

    // parse json
    this.app.use(parser.json());
    this.app.use(parser.urlencoded({ extended: true }));

    // create routes
    router(this.app);
  }

  listen(port = argv.port) {
    const listener = this.app.listen(port || 0, () => {
      console.log(`listening on ${listener.address().port}`);
    });

    return this;
  }
}

module.exports = WafferServer;
