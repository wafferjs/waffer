const fs = require('fs');

const parsers = fs.readdirSync(__dirname).filter(p => p !== 'index.js');

const determine_parser = function (file) {
  const parser = file.split('.').slice(-1)[0] + '.js';

  if (~parsers.indexOf(parser)) {
    return require(`./${parser}`);
  }

  return require(`./file.js`);
}

const parse = function (file, next = function () {}) {
  const parser = determine_parser(file);

  return parser(file, next);
}

module.exports = {
  parse, determine_parser,
}
