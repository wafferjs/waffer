const pug    = require('pug');

const cwd = process.cwd();

const parse = (file, next, exp) => {
  let html;
  let err;

  try {
    html = pug.renderFile(file);
  } catch (e) {
    err = e;
  }

  if (exp && !err) {
    return next(null, require('./html')._export(html, file));
  }

  return next(err, html);
}

module.exports = {
  parse, ext: '.html',
};
