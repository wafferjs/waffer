# Waffer - A MVC web server with exporting functionality

## Install

### For cli usage
```sh
$ npm install -g waffer
```

### For node usage
```sh
$ npm install waffer
```

## Usage

### Creating new project
```sh
# Create new project in current directory
$ waffer init

# Create new project in specified directory
$ waffer init my-website
```

### Creating new views
```sh
$ waffer view my-view
```

### Exporting website to html
```sh
$ waffer export
```

### Serving content
```sh
# At random port
waffer serve

# At desired port
waffer serve --port 3000
```

## Node API

### Basic usage
```js
const waffer = require('waffer');
const server = waffer();

server.listen(3000);
```

### Options
```js
const options = {
  session: {
    // fastify-session options
  },
  logger: {
    // morgan options
  }
};

const waffer = require('waffer');
const server = waffer(options);

server.listen(3000);
```
