const mime   = require('mime/lite')
const fs     = require('fs-extra')
const path   = require('path')
const findup = require('findup-sync')
const status = require('status-codes')

module.exports = (server) => {
  const { log } = server
  const { prod } = server.options
  const utils = require('./utils')(server)
  const cwd = process.cwd()

  let js = ''
  let css = ''

  return async (req, res) => {
    try {
      log.info(req.method, req.url, req.getAllHeaders())

      try {
        req.body = req.method !== 'POST' ? {} : await server._post_body(req)
      } catch (e) {
        console.log(e)
      }
      if (req.url === '/components.css') {
        // build app
        if (css === '' || !prod) {
          // build components
          css = ''
          const dir = path.join(cwd, 'assets', 'components')
          for (const component of await fs.readdir(dir)) {
            const cdir = path.join(dir, component)
            try {
              const { content } = await utils.parse(path.join(cdir, 'style.styl'))
              css += content
            } catch (e) {}
          }
        }

        return utils.serve(res, css, '.css')
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
              res = `${(await utils.parse(findup('component.*', { cwd: cdir }), false)).content}`
              const { content } = await utils.parse(path.join(cdir, 'template.pug'), false, { fragment: true })
              res = res
                .replace(`#template-${component}`, content.replace(/`/g, '\\`'))
                // .replace(/\/\* global.+\*\\s+//g, '')
            } catch (e) {}
            js += res
          }
        }

        return utils.serve(res, js, '.js')
      }

      const slices = req.url.split('/').slice(1)
      const view = slices.shift() || 'index'

      // handle lib
      if (view === '@lib') {
        res.statusCode = 302
        res.setHeader('Location', `https://cdn.jsdelivr.net/npm/${slices.join('/')}`)
        res.setHeader('Content-Length', 0)
        return res.write(Buffer.from(''))
      }

      // handle api calls
      if (view === 'api') {
        const data = await require(path.join(cwd, req.url.split('?')[0].slice(0, -1)))(req)

        let content = ''
        if (data.status && data.status !== 200) {
          res.statusCode = data.status
          content = JSON.stringify({ success: false, ...status.get(data.status) })
        }

        if (!data.status || data.status === 200) {
          content = JSON.stringify({ success: true, ...data })
        }

        res.setHeader('Content-Length', content.length)
        return res.write(Buffer.from(content))
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

        const { content, ext } = await utils.parse(file, false, { ...({}), view, prod: prod })
        return utils.serve(res, content, ext)
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
              err: status.get(res.statusCode),
              route,
              view,
            }
            const { content } = await utils.parse(file, false, { ...({}), ...locals })
            const buf = Buffer.from(content)

            res.setHeader('Content-Length', buf.length)
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            return res.write(buf)
          }

          const locals = {
            err: status.get(res.statusCode),
            route,
            view,
          }
          const { content } = await utils.parse(file, false, { ...({}), ...locals })
          return utils.serve(res, content)
        } else {
          // TODO: scan for views
        }
      }

      // handle static files
      const file = path.join(cwd, 'assets', 'static', req.url)

      const { content, ext } = await utils.parse(file, false, { ...({}), prod: prod })
      log.debug(ext, mime.getType(ext))
      utils.serve(res, content, ext)
    } catch (e) {
      utils.error_route(req, res, e)
    }
  }
}
