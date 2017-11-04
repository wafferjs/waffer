const fs = require('fs');

const parsers = fs.readdirSync(__dirname).filter(p => p !== 'index.js');

const determine_parser = function (file) {
  const ext = file.split('.').slice(-1)[0];
  const parser = ext + '.js';

  if (~parsers.indexOf(parser)) {
    return require(`./${parser}`);
  }

  const default_parser = require(`./file.js`);
  default_parser.ext = ext;

  return default_parser;
}

const parse = function (file, next = function () {}) {
  const parse = determine_parser(file);
  parser.parse(file, function (err, content) {
    next(err, content, ext);
  });
}

module.exports = {
  parse, determine_parser,
}
