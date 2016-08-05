import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import * as User from './models/user'

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  User.findOrCreate({ login: profile.username, id: parseInt(profile.id) }, (err, user) => {
    User.createStarGraph(user.login, accessToken, 0, (err, repo) => {
      if (err) console.log(err)
      return
    })
    User.createSocialGraph(user.login, accessToken, (err, repo) => {
      if (err) console.log(err)
      return
    })
    done(err, user)
  })
}))


passport.serializeUser((user, done) => {
  done(null, user.login)
})

passport.deserializeUser((login, done) => {
  User.findByUsername(login, (err, user) => {
    done(err, user)
  })
})

export default passport
