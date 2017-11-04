const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');
const Database = require('./');

class Mongo extends Database {
  connect() {
    const { host, port, db, user, pass } = this.options;
    const conn = this.connection = mongoose.connect(`mongodb://${host}:${port}/${db}`, {
      useMongoClient: true,
      user,
      pass,
    });

    conn.on('error', err => {
      throw err;
    });

    conn.on('open', e => {
      this.emit('open', e);

      // export ObjectId
      global.ObjectId = mongoose.Schema.Types.ObjectId;

      const cwd = process.cwd();
      const schemas = fs.readdirSync(path.join(cwd, 'schemas'));

      // export schemas
      this.schemas((s, name, sname) => {
        const { hooks, schema } = s;

        // export Schema
        global[sname] = mongoose.Schema(schema);

        // apply hooks
        for (let h in hooks) {
          for (let k in hooks[h]) {
            global[sname][h](k, hooks[h][k]);
          }
        }

        // export Model
        global[name] = mongoose.model(name, global[sname]);

      });

      conn.emit('ready');
    });

    return conn;
  }

};

module.exports = Mongo;
