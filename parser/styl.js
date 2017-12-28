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

      if (url.startsWith('@')) {
        if (!exp) {
          return new nodes.Literal(`url("/${url}")`);
        }

        const parsed  = path.parse(path.join(cwd, 'views', view, 'public', url.slice(1)));
        const fparsed = path.parse(this.filename);
        return new nodes.Literal(`url("${path.join(path.relative(fparsed.dir, parsed.dir), parsed.base)}")`);
      }

      return new nodes.Literal(`url("${url}")`);
    }

    urlfunc.raw = true;
    style.define('url', urlfunc);
  }


  style.render((err, css) => {
    if (err) {
      return next(err, `/**\n${err.message}*/`);
    }

    next(err, css);
  });
};

const parse = (file, next, exp) => {
  fs.readFile(file, function(err, content) {
    const f = file.substr(cwd.length + 7).split('/public/').pop();
    if (err) return fs.readFile(path.join(cwd, 'styles', f), function(err, content) {
      if (err) return next(err);

      render(content, file, next, exp);
    });

    render(content, file, next, exp);
  });
}

module.exports = {
  parse, ext: '.css',
}
