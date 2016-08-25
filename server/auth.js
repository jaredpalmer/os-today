import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import jackrabbit from 'jackrabbit'
import config from './config'

const rabbit = jackrabbit(config.rabbitmqURL)
const exchange = rabbit.default()

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  exchange.publish({
    login: profile.username,
    id: profile._json.id,
    email: profile.emails ? profile.emails[0].value : profile._json.email,
    followers: profile._json.followers,
    avatar_url: profile._json.avatar_url,
    token: accessToken
  }, {
    expiration: config.serviceTime,
    key: 'users.findOrCreate',
    reply (data) {
      if (data.message) {
        done(data.payload, null)
      }
      done(null, data.payload)
    }
  })
}))

passport.serializeUser((user, done) => {
  done(null, user.login)
})

passport.deserializeUser((login, done) => {
  exchange.publish({ login }, {
    expiration: config.serviceTime,
    key: 'users.findByUsername',
    reply (data) {
      if (data.message) {
        done(data.payload, null)
      }
      done(null, data.payload)
    }
  })
})

export default passport
