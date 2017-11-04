const parse5 = require('parse5');
const path   = require('path');
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
    const view = file.substr(cwd.length + 1).substr(6).split('/public/').shift();
    const document = parse5.parse(html, { locationInfo: false });

    const dfs = function (root) {
      try {
        for (let child of root.childNodes) {
          if (child.tagName === 'script') {
            for (let attr of child.attrs) {
              if (attr.name === 'src') {
                if (attr.value[0] === '@') {
                  attr.value = path.join(view, attr.value.substr(1));
                  continue;
                }

                attr.value = attr.value.replace('unpkg:', 'https://unpkg.com/');
              }
            }
          }

          if (child.tagName === 'link') {
            for (let attr of child.attrs) {
              if (attr.name === 'href') {
                if (attr.value[0] === '@') {
                  attr.value = path.join(view, attr.value.substr(1)).replace(/\.(?!css).+$/, '.css');
                  continue;
                }

                attr.value = attr.value.replace('unpkg:', 'https://unpkg.com/').replace(/\.(?!css).+$/, '.css');
              }
            }
          }

          if (child.tagName === 'a') {
            for (let attr of child.attrs) {
              if (attr.name === 'href') {
                attr.value = attr.value.replace(/^\/([^/]+)\/$/, '$1.html');
              }
            }
          }

          dfs(child);
        }
      } catch (e) {};

      return root;
    };

    return next(null, parse5.serialize(dfs(document)));
  }

  return next(err, html);
}

module.exports = {
  parse, ext: '.html',
};
