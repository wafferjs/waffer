[![waffer](https://img.shields.io/npm/v/waffer.svg?label=waffer&colorB=bd0050&style=for-the-badge)](https://www.npmjs.org/package/waffer)
[![waffer-cli](https://img.shields.io/npm/v/waffer-cli.svg?label=waffer-cli&colorB=bd0050&style=for-the-badge)](https://www.npmjs.org/package/waffer-cli)
![license](https://img.shields.io/github/license/wafferjs/waffer.svg?style=for-the-badge)

# Waffer
Simple web server

## Install

#### For cli usage
```sh
$ npm install -g waffer-cli
```

There is now a new repo for cli [wafferjs/waffer-cli](/wafferjs/waffer-cli)

#### For node usage
```sh
$ npm install waffer
```

## Usage

#### Basic usage
```js
const waffer = require('waffer');
const server = waffer();

server.listen(3000);
```

#### Options
```js
const options = {
  logger: {
    // pino options
  },
  prod: false, // production mode
  debug: true, // debug mode
};

const waffer = require('waffer');
const server = waffer(options);

server.listen(3000);
```
