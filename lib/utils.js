const path = require('path')
const kindof = require('kind-of')
const mime = require('mime/lite')
const status = require('status-codes')

module.exports = server => {
  const { log } = server
  const cwd = process.cwd()

  const parse = async (file, exporting = false, options = {}) => {
    const original_ext = '.' + file.split('.').slice(-1)[0]
    const parser = server.parser(original_ext)

    const { content, ext } = await parser.parse(file, exporting, options)
    // TEMP: Temporary fix for content-type
    return { content, ext: ext || parser.ext || original_ext }
  }

  const serve = (res, content, ext = '.html') => {
    const buf = kindof(content) === 'buffer' ? content : Buffer.from(content)

    res.setHeader('Content-Type', mime.getType(ext) + '; charset=utf-8')
    res.setHeader('Content-Length', buf.length)
    res.write(buf)
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
    serve(res, content)
  }

  return { error_route, parse, serve }
}
