const Mongo     = require('./database/mongo');
const Database  = require('./database');
const Server    = require('./server');

module.exports = function () {
  return new Server();
};

module.exports.database = {
    Database,
    Mongo,
};
