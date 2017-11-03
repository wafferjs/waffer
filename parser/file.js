const fs = require('fs-extra');

module.exports = (file, next) => {
  return fs.readFile(file, function (err, buf) {
    return next(err, buf);
  });
}
