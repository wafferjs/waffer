const pug = require('pug');

module.exports = (file, next) => {
  let html;
  let err;

  try {
    html = pug.renderFile(file);
  } catch (e) {
    err = e;
  }

  return next(err, html);
}
