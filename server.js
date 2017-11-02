const compress = require('compression');
const parser   = require('body-parser');
const optimist = require('optimist');
const router   = require('./router');
const express  = require('express');
const morgan   = require('morgan');

const { argv } = optimist;
const app      = express();

// compression
app.use(compress());

// logger
app.use(morgan('dev'));

// parse json
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// create routes
router(app);

module.exports = {
  listen: function (port = argv.port) {
    const listener = app.listen(port || 0, () => {
      console.log(`listening on ${listener.address().port}`);
    });

    return this;
  },

  use: function (middleware) {
    if (middleware != null) {
      app.use(middleware);
    }

    return this;
  },

  app: function () {
    return app;
  },
}
