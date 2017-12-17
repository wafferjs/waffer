const parse5 = require('parse5');
const path   = require('path');
const fs     = require('fs');

const cwd = process.cwd();

const _export = (content, file) => {
  const view = file.substr(cwd.length + 1).substr(6).split('/public/').shift();
  const document = parse5.parse(content, { locationInfo: false });

  const dfs = function (root) {
    try {
      for (let child of root.childNodes) {
        if (child.tagName === 'script') {
          for (let attr of child.attrs) {
            if (attr.name === 'src') {
              attr.value = attr.value.replace('@lib/', 'https://unpkg.com/');
              if (attr.value[0] === '@') {
                attr.value = path.join(view, attr.value.substr(1));
                continue;
              }
            }
          }
        }

        if (child.tagName === 'link') {
          let rel = 'stylesheet';
          for (let attr of child.attrs) {
            if (attr.name === 'rel') {
              rel = attr.value;
            }
          }

          for (let attr of child.attrs) {
            if (attr.name === 'href') {
              if (~attr.value.indexOf('@lib')) {
                attr.value = attr.value.replace('@lib/', 'https://unpkg.com/');
                continue;
              }

              if (attr.value[0] === '@') {
                attr.value = path.join(view, attr.value.substr(1));

                if (rel === 'stylesheet') {
                  attr.value = attr.value.replace(/\.(?!css).+$/, '.css');
                }

                continue;
              }

              attr.value = attr.value.replace(/\.(?!css).+$/, '.css');
            }
          }
        }

        if (child.tagName === 'img') {
          for (let attr of child.attrs) {
            if (attr.name === 'src') {
              if (attr.value[0] === '@') {
                attr.value = path.join(view, attr.value.substr(1));
              }
            }
          }
        }

        if (child.tagName === 'a') {
          for (let attr of child.attrs) {
            if (attr.name === 'href') {
              if (attr.value[0] === '@') {
                attr.value = path.join(view, attr.value.substr(1));
              }
              attr.value = attr.value.replace(/^\/([^/]+)\/$/, '$1.html');
            }
          }
        }

        dfs(child);
      }
    } catch (e) {};

    return root;
  };

  return parse5.serialize(dfs(document));
}

const parse = (file, next, exp) => {
  return fs.readFile(file, function (err, buf) {
    const ext = '.' + file.split('.').slice(-1)[0];

    if (exp && !err) {
      return next(null, _export(`${buf}`, file));
    }

    return next(err, buf);
  });
}

module.exports = {
  parse, ext: '.html', _export,
};
