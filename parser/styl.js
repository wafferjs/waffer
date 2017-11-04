const stylus = require('stylus');
const utilus = require('utilus');
const path   = require('path');
const nib    = require('nib');
const fs     = require('fs');

const cwd    = process.cwd();

utilus.path = path.join(__dirname, '../node_modules/utilus/');

const render = (content, file, next, exp) => {
  const style = stylus(`${content}`).set('filename', file);

  style.set('filename', file);
  style.set('include css', true);

  // add nib for css backward compatibility
  style.include(nib.path).import('nib');

  // add utilus for easier positioning
  style.include(utilus.path).import('utilus');

  // add global styles
  style.include(path.join(cwd, 'styles'));

  if (exp) {
    // style.define('url', stylus.url({ paths: [exp] }))
    const p = file.substr(cwd.length + 1);

    // we care only about views
    if (p.startsWith('views/')) {
      const div = p.substr(6).split('/public/');
      const view = div.shift();

      const urlfunc = function (url) {
        const Compiler = require('stylus/lib/visitor/compiler');
        const nodes    = require('stylus/lib/nodes');
        const compiler = new Compiler();

        url = url.nodes.map(function(node){
          return compiler.visit(node);
        }).join('');

        if (fs.existsSync(path.join(cwd, 'views', view, 'public', url))) {
          return new nodes.Literal(`url("${url}")`);
        }

        return new nodes.Literal(`url("..${url}")`);
      }

      urlfunc.raw = true;
      style.define('url', urlfunc);
    }

  }

  style.render((err, css) => {
    if (err) {
      return;
    }

    next(err, css);
  });
};

const parse = (file, next, exp) => {
  fs.readFile(file, function(err, content) {
    if (err) return fs.readFile(file, function(err, content) {
      if (err) return next(err);

      render(content, file, next, exp);
    });

    render(content, file, next, exp);
  });
}

module.exports = {
  parse, ext: '.css',
}
