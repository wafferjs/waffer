const parse5 = require('parse5');
const path   = require('path');
const fs     = require('fs');
const parser = require('./');

const cwd = process.cwd();

const _export = (content, file) => {
  const view = file.substr(cwd.length + 1).substr(6).split('/').shift();
  const document = parse5.parse(content, { locationInfo: false });

  const source = url => {
    if (url.startsWith('http')) return url;

    if (url[0] === '/') {
      url = url.slice(1);
    }
    
    else if (url[0] === '@') {
      if (url.startsWith('@lib/')) {
        return url.replace('@lib/', 'https://unpkg.com/');
      }

      url = path.join(view, url.slice(1));
    }

    const parsed_url = path.parse(url);
    const { ext } = parser.determine_parser(parsed_url.ext);

    if (ext === null) {
      return url;
    }

    return path.join(parsed_url.dir, parsed_url.name + ext);
  }

  const dfs = function (root) {
    if (!('childNodes' in root)) return;

    try {
      for (let child of root.childNodes) {
        if (child.tagName === 'script') {
          for (let attr of child.attrs) {
            if (attr.name === 'src') {
              attr.value = source(attr.value);
            }
          }
        }

        if (child.tagName === 'link') {
          for (let attr of child.attrs) {
            if (attr.name === 'href') {
              attr.value = source(attr.value);
            }
          }
        }

        if (child.tagName === 'img') {
          for (let attr of child.attrs) {
            if (attr.name === 'src') {
              attr.value = source(attr.value);
            }
          }
        }

        if (child.tagName === 'a') {
          for (let attr of child.attrs) {
            if (attr.name === 'href') {
              attr.value = source(attr.value);
            }
          }
        }

        dfs(child);
      }
    } catch (e) {
      console.log(root, e)
    };

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
