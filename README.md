# waffer
Personal web server

### cli usage
```
waffer init [<dir>]          # initialize waffer project
waffer serve [--port <port>] # simple serve
waffer export                # export all views into simple html site
waffer help                  # display help
```

### node usage
```js
const waffer = require('waffer');
const server = waffer();

server.listen(3000);

const db = new waffer.database.Mongo({
  user: 'admin',
  pass: 'pass',
  host: 'localhost',
  port: 27017,
  db: 'test',
});

const connection = db.connect();
```
