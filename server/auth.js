import passport from 'passport'
import GitHubStrategy from 'passport-github'
import * as User from './models/user'

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOrCreate({ login: profile.username })
    .then(user => {
      done(null, user)
    })
    .catch(e => {
      done(e, null)
    })
}))

passport.serializeUser((user, done) => {
  done(null, user.login)
})

passport.deserializeUser((login, done) => {
  User.findByUsername(login)
    .then(user => {
      done(null, user)
    })
    .catch(e => {
      done(e, null)
    })
})

export default passport
