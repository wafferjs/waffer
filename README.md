# waffer
Personal web server

### cli usage
```
waffer init [<dir>]          # initialize waffer project 
waffer export <dir>          # export all views into simple html site
waffer serve [--port <port>] # simple serve
```

### node usage
```js
const waffer = require('waffer');

const { server, database } = waffer;

server.listen(3000);

server.use(new database.Mongo({
  user: 'admin',
  pass: 'pass',
  host: 'localhost',
  port: 27017,
  db: 'test',
}));
```
