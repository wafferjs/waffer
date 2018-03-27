const mime    = require('mime/lite')
const fs      = require('fs-extra')
const path    = require('path')

/**
 * server structure:
 * ├─ assets/
 * │  ├─ components/
 * │  │  └─ main/
 * │  │     ├─ component.js
 * │  │     ├─ style.styl
 * │  │     └─ template.pug
 * │  │
 * │  ├─ static/
 * │  │  ├─ app.js *virtual
 * │  │  ├─ reset.styl
 * │  │  └─ vue.js *virtual
 * │  │
 * │  └─ styles/
 * │     └─ variables.styl
 * │
 * ├─ models/
 * │  └─ user.js
 * │
 * ├─ services/
 * │  ├─ index/
 * │  │  └─ index.js
 * │  └─ view/
 * │     └─ index.js
 * │
 * └─ views/
 *    ├─ index/
 *    │  ├─ scripts
 *    │  │  └─ *.js
 *    │  ├─ styles
 *    │  │  └─ *.styl
 *    │  └─ index.pug
 *    │
 *    └─ view/
 *       ├─ scripts
 *       │  └─ *.js
 *       ├─ styles
 *       │  └─ *.styl
 *       ├─ index.pug
 *       └─ routes.js
 */

module.exports = (server) => {
  const { log } = server
  const cwd = process.cwd()

  let js = ''

  const parse = async (file, exporting = false, options = {}) => {
    const ext = '.' + file.split('.').slice(-1)[0]
    const parser = server.parser(ext)

    return parser.parse(file, exporting, options)
  }

  return async (req, res) => {
    log.info(req.method, req.url, req.getAllHeaders())

    // static vue.js
    if (req.url === '/vue.js') {
      const file = server.prod && !server.debug ? 'vue.min.js' : 'vue.js'
      const buf = await fs.readFile(`${__dirname}/../node_modules/vue/dist/${file}`)

      res.setHeader('Content-Type', mime.getType('.js'))
      res.setHeader('Content-Length', buf.length)
      return res.write(buf)
    }

    if (req.url === '/app.js') {
      // build app
      if (js === '' || !server.prod) {
        // build components
        js = ''
        const dir = path.join(cwd, 'components')
        for (const component of await fs.readdir(dir)) {
          const cdir = path.join(dir, component)
          const { content } = await parse(path.join(cdir, 'template.pug'), false, { fragment: true })
          js += `${await fs.readFile(path.join(cdir, 'component.js'))}\n`.replace(`#template-${component}`, content)
        }
      }

      const buf = Buffer.from(js)

      res.setHeader('Content-Type', mime.getType('.js'))
      res.setHeader('Content-Length', buf.length)
      return res.write(buf)
    }

    const slices = req.url.split('/').slice(1)
    const view = slices.shift() || 'index'
    log.debug(view, slices)

    // handle lib
    if (view === '@lib') {
      res.statusCode = 302
      res.setHeader('Location', `https://unpkg.com/${slices.join('/')}`)
      res.setHeader('Content-Length', 0)
      return res.write(Buffer.from(''))
    }

    // handle view files
    if (view[0] === '@' || (slices.length && slices[0][0] === '@')) {
      let file;
      if (view[0] === '@') {
        const f = view.slice(1) + '/' + slices.join('/')
        file = path.join(cwd, 'views', 'index', f)
      }
      if (slices.length && slices[0][0] === '@') {
        const f = slices[0].slice(1) + '/' + slices.slice(1).join('/')
        file = path.join(cwd, 'views', view, f)
      }

      const { content, ext } = await parse(file, false, { ...({}), view, prod: server.prod, tmp: server.tmp.name })
      const buf = Buffer.from(content)

      res.setHeader('Content-Length', buf.length)
      res.setHeader('Content-Type', mime.getType(ext))
      return res.write(buf)
    }

    // handle views
    if (req.url[req.url.length - 1] === '/') {
      if (!server.prod) {
        log.debug(view)
        const file = path.join(cwd, 'views', view, 'index.pug')
        const route =  slices.length ? slices.join('/') : '/'

        const { content, ext } = await parse(file, false, { ...({}), route, view, prod: server.prod, tmp: server.tmp.name })
        const buf = Buffer.from(content)

        res.setHeader('Content-Length', buf.length)
        res.setHeader('Content-Type', mime.getType(ext))
        return res.write(buf)
      } else {
        // TODO: scan for views
      }
    }

    try {
      // handle static files
      const file = path.join(cwd, 'static', req.url)

      const { content, ext } = await parse(file, false, { ...({}), prod: server.prod, tmp: server.tmp.name })
      const buf = Buffer.from(content)
      res.setHeader('Content-Length', buf.length)
      res.setHeader('Content-Type', mime.getType(ext))
      res.write(buf)
    } catch (e) {
      const buf = Buffer.from(e.stack)
      log.error(e)

      res.setHeader('Content-Length', buf.length)
      res.write(buf)
    }
  }

  /*
  app.get('/components.css', async (request, reply) => {
    reply.type(mime.getType('.css'))

    let css = ''
    const dir = path.join(cwd, 'components')
    for (const component of await fs.readdir(dir)) {
      const cdir = path.join(dir, component)
      const { content } = await parse(path.join(cdir, 'style.styl'))
      css += content
    }

    return css
  })
  */
}
