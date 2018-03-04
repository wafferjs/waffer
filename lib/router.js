const mime    = require('mime/lite')
const fs      = require('fs-extra')
const path    = require('path')

/**
 * server structure:
 *
 * ├─ static/
 * │  └─ reset.styl
 * │
 * ├─ styles/
 * │  └─ variables.styl
 * │
 * ├─ controllers/
 * │  ├─ index/
 * │  │  └─ index.js
 * │  └─ view/
 * │     └─ index.js
 * │
 * └─ views/
 *    ├─ index/
 *    │  ├─ styles
 *    │  │  └─ *.styl
 *    │  ├─ scripts
 *    │  │  └─ *.js
 *    │  └─ index.pug
 *    │
 *    └─ view/
 *       ├─ styles
 *       │  └─ *.styl
 *       ├─ scripts
 *       │  └─ *.js
 *       └─ index.pug
 */

module.exports = server => {
  const { app } = server;
  const cwd = process.cwd();

  const parse = async (file, exporting = false, options = {}) => {
    const ext = '.' + file.split('.').slice(-1)[0];
    const parser = server.parser(ext);

    return await parser.parse(file, exporting, options)
  }

  // add vue
  app.get('/vue.js', async (request, reply) => {
    reply.type(mime.getType('.js'))
   return await fs.readFile(`./node_modules/vue/dist/${server.prod && !server.debug ? 'vue.min.js' : 'vue.js'}` )
  })

  // handle: @lib/:file
  for (const path of ['/:view/@lib/:lib/*', '/:view/@lib/:lib', '/@lib/:lib/*', '/@lib/:lib' ]) {
    app.get(path, async (request, reply) => {
      const { params } = request
      if (params['*']) {
        return reply.redirect(`https://unpkg.com/${params.lib}/${params['*']}`)
      }

      reply.redirect(`https://unpkg.com/${params.lib}`)
    })
  }



  if (server.prod) {
    // scan dirs and make routes
    return
  } 

  // handle views
  for (const url of [ '/', '/:view/', '/:view/*' ]) {
    app.get(url, async (request, reply) => {
      const view = request.params.view || 'index'
      const file = path.join(cwd, 'views', view, 'index.pug')
      const route = request.params['*'] || '/'

      const { content, ext } = await parse(file, false, { ...(request.session || {}), route, view,  prod: server.prod, tmp: server.tmp.name })

      app.log.debug(ext)
      reply.type(mime.getType(ext))
      return content
    })
  }

  // handling view files
  for (const url of [ '/@*', '/:view/@*' ]) {
    app.get(url, async (request, reply) => {
      const view = request.params.view || 'index'
      const file = path.join(cwd, 'views', view, request.params['*'])

      const { content, ext } = await parse(file, false, { ...(request.session || {}), view,  prod: server.prod, tmp: server.tmp.name })

      reply.type(mime.getType(ext))
      return content
    })
  }
  
  // handle static files
  app.get('*', async (request, reply) => {
    const file = path.join(cwd, 'static', request.params['*'])
    const { content, ext } = await parse(file, false, { ...(request.session || {}),  prod: server.prod, tmp: server.tmp.name })

    reply.type(mime.getType(ext))
    return content
  })
}
