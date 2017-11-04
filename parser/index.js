const fs = require('fs');

const parsers = fs.readdirSync(__dirname).filter(p => p !== 'index.js');

const determine_parser = function (file) {
  const ext = file.split('.').slice(-1)[0];
  const name = ext + '.js';

  if (~parsers.indexOf(name)) {
    return require(`./${name}`);
  }

  return require(`./file.js`);
}

const parse = function (file, next = function () {}, exp = false, options = {}) {
  const ext = '.' + file.split('.').slice(-1)[0];

  const parser = determine_parser(file);
  parser.parse(file, function (err, content) {
    next(err, content, parser.ext || ext);
  }, exp, options);
}

module.exports = {
  parse, determine_parser,
}
