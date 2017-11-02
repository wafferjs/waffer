const Mongo     = require('./database/mongo');
const Database  = require('./database');
const server    = require('./server');
const optimist  = require('optimist');

const { argv } = optimist;

if (argv.init) {

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
