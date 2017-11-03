const stylus = require('stylus');
const utilus = require('utilus');
const path   = require('path');
const nib    = require('nib');
const fs     = require('fs');

const cwd    = process.cwd();

utilus.path = path.join(__dirname, '../node_modules/utilus/');

module.exports = (file, next) => {
  const parse = content => {
    const renderer = stylus(`${content}`).set('filename', file);

    renderer.set('filename', file);
    renderer.set('include css', true);

    // add nib for css backward compatibility
    renderer.include(nib.path).import('nib');

    // add utilus for easier positioning
    renderer.include(utilus.path).import('utilus');

    // add global styles
    renderer.include(path.join(cwd, 'styles'));

    renderer.render((err, css) => {
      if (err) {

        return;
      }

      next(err, css);
    });
  };

  fs.readFile(file, function(err, content) {
    if (err) return fs.readFile(file, function(err, content) {
      if (err) return next(err);

      parse(content);
    });

    parse(content);
  });
}
