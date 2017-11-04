const fs     = require('fs');

const parse = (file, next) => {
  return fs.readFile(file, function (err, buf) {
    const ext = '.' + file.split('.').slice(-1)[0];
    return next(err, buf, ext);
  });
}

module.exports = {
  parse, ext: null,
};
