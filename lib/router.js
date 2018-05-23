const status = require('status-codes')
const mime   = require('mime/lite')
const fs     = require('fs-extra')
const path   = require('path')
const findup = require('findup-sync')

module.exports = (server) => {
  const { log } = server
  const { debug, prod } = server.options
  const cwd = process.cwd()

  let js = ''
  let css = ''

  const parse = async (file, exporting = false, options = {}) => {
    const original_ext = '.' + file.split('.').slice(-1)[0]
    const parser = server.parser(original_ext)

    const { content, ext } = await parser.parse(file, exporting, options)
    // TEMP: Temporary fix for content-type
    return { content, ext: ext || parser.ext || original_ext }
  }

  const error_route = async (req, res, err) => {
    const file = path.join(cwd, 'views', 'index', 'index.pug')

    if (err instanceof Error) {
      res.statusCode = err.code === 'ENOENT' ? 404 : 500
    }

    if (err instanceof Number) {
      res.statusCode = err
    }

    log.error(err)

    const locals = {
      err: { ...status.get(res.statusCode), stack: err.stack },
    }

    const { content } = await parse(file, false, { ...({}), ...locals })
    const buf = Buffer.from(content)

    res.setHeader('Content-Length', buf.length)
    res.write(buf)
  }

  const serve_module = async (req, res, name, fdebug, dir) => {
    if (req.url === `/${name}.js`) {
      let file = `${name}.js`

      if (fdebug === true) {
        file = prod && !debug ? `${name}.min.js` : `${name}.js`
      }

      if (fdebug.push !== undefined) {
        file = fdebug[!prod || debug]
      }

      if (typeof fdebug === 'string') {
        file = fdebug
      }

      const buf = await fs.readFile(`${__dirname}/../../${dir || name + '/dist'}/${file}`)

      res.setHeader('Content-Type', mime.getType('.js'))
      res.setHeader('Content-Length', buf.length)
      res.write(buf)
      return true
    }
  }

  return async (req, res) => {
    try {
      log.info(req.method, req.url, req.getAllHeaders())

      // serve modules
      if (await serve_module(req, res, 'vue', true)) return
      if (await serve_module(req, res, 'vue-router', true)) return
      if (await serve_module(req, res, 'axios', true)) return
      if (await serve_module(req, res, 'vue-progressbar', 'vue-progressbar.js')) return

      if (req.url === '/components.css') {
        // build app
        if (css === '' || !prod) {
          // build components
          css = ''
          const dir = path.join(cwd, 'assets', 'components')
          for (const component of await fs.readdir(dir)) {
            const cdir = path.join(dir, component)
            try {
              const { content } = await parse(path.join(cdir, 'style.styl'))
              css += content
            } catch (e) {}
          }
        }

        const buf = Buffer.from(css)

        res.setHeader('Content-Type', mime.getType('.css'))
        res.setHeader('Content-Length', buf.length)
        return res.write(buf)
      }
      if (req.url === '/components.js') {
        // build app
        if (js === '' || !prod) {
          // build components
          js = ''
          const dir = path.join(cwd, 'assets', 'components')
          for (const component of await fs.readdir(dir)) {
            const cdir = path.join(dir, component)

            let res = ''
            try {
              res = `${(await parse(findup('component.*', { cwd: cdir }), false)).content}`
              const { content } = await parse(path.join(cdir, 'template.pug'), false, { fragment: true })
              res = res
                .replace(`#template-${component}`, content.replace(/`/g, '\\`'))
                // .replace(/\/\* global.+\*\\s+//g, '')
            } catch (e) {}
            js += res
          }
        }

        const buf = Buffer.from(js)

        res.setHeader('Content-Type', mime.getType('.js'))
        res.setHeader('Content-Length', buf.length)
        return res.write(buf)
      }

      const slices = req.url.split('/').slice(1)
      const view = slices.shift() || 'index'

      // handle lib
      if (view === '@lib') {
        res.statusCode = 302
        res.setHeader('Location', `https://unpkg.com/${slices.join('/')}`)
        res.setHeader('Content-Length', 0)
        return res.write(Buffer.from(''))
      }

      // handle view files
      if (view[0] === '@' || ~req.url.indexOf('@')) {
        let file
        if (view[0] === '@') {
          const f = view.slice(1) + '/' + slices.join('/')
          file = path.join(cwd, 'views', 'index', f)
        }

        for (var i = 0; i < slices.length; i++) {
          if (slices[i][0] === '@') {
            const f = slices[i].slice(1) + '/' + slices.slice(i + 1).join('/')
            file = path.join(cwd, 'views', view, f)

            if (!fs.existsSync(file)) {
              file = path.join(cwd, 'views', 'index', f)
            }

            break
          }
        }

        const { content, ext } = await parse(file, false, { ...({}), view, prod: prod, tmp: server.tmp.name })
        const buf = Buffer.from(content)

        res.setHeader('Content-Length', buf.length)
        res.setHeader('Content-Type', mime.getType(ext))
        return res.write(buf)
      }

      // handle views
      if (req.url[req.url.length - 1] === '/') {
        if (!prod) {
          const file = path.join(cwd, 'views', view, 'index.pug')
          const route =  slices.length ? slices.join('/') : '/'

          if (!fs.existsSync(file)) {
            const view = 'index'
            const file = path.join(cwd, 'views', view, 'index.pug')
            const route = req.url

            const locals = {
              tmp: server.tmp.name,
              err: status.get(res.statusCode),
              route,
              view,
            }
            const { content } = await parse(file, false, { ...({}), ...locals })
            const buf = Buffer.from(content)

            res.setHeader('Content-Length', buf.length)
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            return res.write(buf)
          }

          const locals = {
            tmp: server.tmp.name,
            err: status.get(res.statusCode),
            route,
            view,
          }
          const { content } = await parse(file, false, { ...({}), ...locals })
          const buf = Buffer.from(content)

          res.setHeader('Content-Length', buf.length)
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.write(buf)
        } else {
          // TODO: scan for views
        }
      }

      // handle static files
      const file = path.join(cwd, 'assets', 'static', req.url)

      const { content, ext } = await parse(file, false, { ...({}), prod: prod, tmp: server.tmp.name })
      const buf = Buffer.from(content)
      res.setHeader('Content-Length', buf.length)
      res.setHeader('Content-Type', mime.getType(ext))
      log.debug(ext, mime.getType(ext))
      res.write(buf)
    } catch (e) {
      error_route(req, res, e)
    }
  }
}
