const fs = require('fs');

const parsers = fs.readdirSync(__dirname).filter(p => p !== 'index.js');

const determine_parser = function (file) {
  const ext = file.split('.').slice(-1)[0];
  const name = ext + '.js';

  if (~parsers.indexOf(name)) {
    const parser = require(`./${name}`);
    parser.name = ext;

    return parser;
  }

  const parser = require(`./file.js`);
  parser.name = ext;
  parser.ext = ext;

  return parser;
}

const parse = function (file, next = function () {}) {
  const parser = determine_parser(file);
  parser.parse(file, function (err, content) {
    next(err, content, parser.ext);
  });
}

module.exports = {
  parse, determine_parser,
}
