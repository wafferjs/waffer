const Mongo     = require('./database/mongo');
const Database  = require('./database');
const server    = require('./server');
const fs        = require('fs-extra');
const optimist  = require('optimist');
const path      = require('path');

const { argv } = optimist;

if (argv.init != null) {
  if (argv.init === true) {
    argv.init = '.';
  }

  fs.copySync(path.join(__dirname, 'template'), path.join(process.cwd(), argv.init));
  return;
}

if (argv.export) {
  return;
}

if (argv.s || argv.serve) {
  server.listen();

  if (argv.S || argv.session) {
    server.use();
  }

  return;
}

module.exports = {
  server,
  database: {
    Database,
    Mongo,
  },
}
