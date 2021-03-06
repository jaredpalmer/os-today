import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import http from 'http'
import serialize from 'serialize-javascript'
import session from 'express-session'
const RedisStore = require('connect-redis')(session)
import errorhandler from 'errorhandler'
import throng from 'throng'

import DefaultServerConfig from './config'
import userApi from './users/route'
import passport from './auth'


function createServer (config) {
  const __PROD__ = config.nodeEnv === 'production'
  let assets
  const app = express()
  app.disable('x-powered-by')
  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(session({
    store: new RedisStore({ url: config.redisURL }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    key: 'sessionId6', // Use generic cookie name for security purposes
    cookie: {
      httpOnly: true, // Add HTTPOnly, Secure attributes on Session Cookie
      secure: false // If secure is set, and you access your site over HTTP, the cookie will not be set
    }
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  if (__PROD__) {
    assets = require('../assets.json')
    app.use(helmet())
    app.use(compression())
    app.use(morgan('combined'))
  } else {
    config = require('../tools/webpack.dev')
    const webpack = require('webpack')
    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware = require('webpack-hot-middleware')
    const compiler = webpack(config)
    const middleware = webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath,
      silent: true,
      stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
      }
    })
    app.use(morgan('dev'))
    app.use(middleware)
    app.use(webpackHotMiddleware(compiler))
  }

  // Let'sEncrypt Route
  app.get('/.well-known/acme-challenge/:content', (req, res) => {
    res.send(process.env.LETS_ENCRYPT || 'xxxxxxxxxxxxx')
  })

  app.get('/auth/github', passport.authenticate('github', { scope: ['user', 'public_repo'] }))

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/')
    })

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
  })

  app.use('/api/v0/users/', userApi)

  app.get('/*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <title>Open Source Today</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/x-icon" href="favicon.ico">
          <link rel="stylesheet" href="${__PROD__ ? assets.main.css : 'assets/styles.css'}" />
        </head>
        <body>
          <div id="root"></div>
          <script>window.Promise || document.write('\\x3Cscript src=\"/es6-promise.min.js\">\\x3C/script>\\x3Cscript>ES6Promise.polyfill()\\x3C/script>')</script>
          <script>window.fetch || document.write('\\x3Cscript src=\"/fetch.min.js\">\\x3C/script>')</script>
          <script>window.__STATE__=${serialize({user: req.user || null})};</script>
          <script src="${__PROD__ ? assets.vendor.js : '/assets/vendor.js'}"></script>
          <script src="${__PROD__ ? assets.main.js : '/assets/main.js'}"></script>
        </body>
      </html>
    `)
  })

  app.use(errorhandler())

  const server = http.createServer(app)

  if (config.timeout) {
    server.setTimeout(config.timeout, (socket) => {
      const message = `Timeout of ${config.timeout}ms exceeded`

      socket.end([
        'HTTP/1.1 503 Service Unavailable',
        `Date: ${(new Date).toGMTString()}`,  // eslint-disable-line
        'Content-Type: text/plain',
        `Content-Length: ${message.length}`,
        'Connection: close',
        '',
        message
      ].join(`\r\n`))
    })
  }

  return server
}

function startServer (serverConfig) {
  const config = Object.assign({}, DefaultServerConfig, serverConfig)

  const server = createServer(config)
  server.listen(config.port || 5000, () => {
    console.log('Server #%s listening on port %s, Ctrl+C to stop', config.id, config.port || 5000)
  })
}

if (require.main === module) {
  throng({
    start: (id) => startServer({ id }),
    workers: process.env.WEB_CONCURRENCY || 1,
    lifetime: Infinity
  })
}

module.exports = createServer
