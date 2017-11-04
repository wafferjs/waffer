const pug = require('pug');

const parse = (file, next) => {
  let html;
  let err;

  try {
    html = pug.renderFile(file);
  } catch (e) {
    err = e;
  }

  return next(err, html);
}

module.exports = {
  parse, ext: '.html',
};
