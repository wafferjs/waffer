const Events = require('events');
const path   = require('path');
const fs     = require('fs');

class Database extends Events {
  constructor(options) {
    if (options == null) {
      throw new Error('You must supply database connection options');
    }

    this.options = options;

    this.connect();
  }

  connect() {
    throw new Error('Connect method not set');
  }

  schemas(fn) {
    if (!(fn instanceof Function)) {
      throw new Error('Schema parser is not a function')
    }

    const cwd = process.cwd();
    const schemas = fs.readdirSync(path.join(cwd, 'schemas'));

    for (let file of schemas) {
      const name    = file.split('.').map(w => w[0].toUpperCase() + w.substr(1)).shift();
      fn(require(path.join(cwd, 'schemas', file)), name, name + 'Schema');
    }

    return this;
  }

}

module.exports = Database;
