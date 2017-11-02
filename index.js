const Mongo     = require('./database/mongo');
const Database  = require('./database');
const server    = require('./server');

module.exports = {
  server,
  database: {
    Database,
    Mongo,
  },
}
