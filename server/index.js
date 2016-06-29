import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import path from 'path'
import cookieParser from 'cookie-parser'
import serialize from 'serialize-javascript'
import session from 'express-session'
const RedisStore = require('connect-redis')(session)
import passport from './auth'

const __PROD__ = process.env.NODE_ENV === 'production'
let config, assets

const server = express()

server.disable('x-powered-by')
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser(process.env.COOKIE_SECRET || 'keyboard cat'))
server.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL || 'redis://localhost:6379' }),
  secret: process.env.COOKIE_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  key: 'sessionId', // Use generic cookie name for security purposes
  cookie: {
    httpOnly: true, // Add HTTPOnly, Secure attributes on Session Cookie
    secure: __PROD__ // If secure is set, and you access your site over HTTP, the cookie will not be set
  }
}))

server.use(passport.initialize())
server.use(passport.session())

if (__PROD__) {
  config = require('../tools/webpack.prod')
  assets = require('../assets.json')
  server.use(helmet())
  server.use(compression())
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
  server.use(morgan('dev'))
  server.use(middleware)
  server.use(webpackHotMiddleware(compiler))
}

server.use(express.static(path.join(__dirname, '../public')))

server.get('/auth/github', passport.authenticate('github', { scope: ['user', 'public_repo'] }))

server.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/')r
  })

server.get('/*', (req, res) => {
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
        <script>window.__STATE__ = ${serialize({user: req.user || null})}</script>
        <script src="${__PROD__ ? assets.vendor.js : 'assets/vendor.js'}"></script>
        <script src="${__PROD__ ? assets.main.js : 'assets/main.js'}"></script>
      </body>
    </html>
  `)
})

server.listen(5000, '0.0.0.0', () => {
  console.log('Listening on port 5000')
})
