const waffer = require('..');
const server = waffer();

server.listen(3000);

const db = new waffer.database.Mongo({
  user: 'admin',
  pass: 'pass',
  host: 'localhost',
  port: 27017,
  db: 'test',
});

//const connection = db.connect();
