#!/usr/bin/node

const Mongo     = require('./database/mongo');
const Database  = require('./database');
const server    = require('./server');
const fs        = require('fs-extra');
const optimist  = require('optimist');
const path      = require('path');

const { argv } = optimist;

if (argv._[0] === 'init') {
  const dir = argv._.length < 2 ? '.' : argv._[1];

  const src = path.join(__dirname, 'template');
  const dest = path.join(process.cwd(), dir);
  fs.copySync(src, dest);
  console.log('new waffer project initialized');
  return;
}

if (argv.export) {
  return;
}

if (!fs.existsSync(path.join(process.cwd(), 'views'))) {
  console.error('error: not a valid waffer project');
  return;
}

server.listen();
