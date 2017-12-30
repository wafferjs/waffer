# Waffer [![Build Status](https://travis-ci.org/wvffle/waffer.svg?branch=master)](https://travis-ci.org/wvffle/waffer)
A MVC web server with exporting functionality

## Install

#### For cli usage
```sh
$ npm install -g waffer
```

#### For node usage
```sh
$ npm install waffer
```

## Usage

#### Help
```sh
$ waffer help
waffer [--port <port>]   # start application
waffer new [<dir>]       # initialize waffer project
waffer view <name>       # create new view
waffer controller <name> # create new controller
waffer export            # export all views into simple html site
waffer help              # display help
```

#### Creating new project
```sh
# Create new project in current directory
$ waffer new

# Create new project in specified directory
$ waffer new my-website
```

#### Creating new views
```sh
$ waffer view my-view
```

#### Creating new controllers
```sh
$ waffer controller my-controller
```

#### Exporting website to html
```sh
$ waffer export
```

#### Serving content
```sh
# At random port
waffer

# At desired port
waffer --port 3000
```

## Node API

#### Basic usage
```js
const waffer = require('waffer');
const server = waffer();

server.listen(3000);
```

#### Options
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
