import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import * as User from './models/user'

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  User.findOrCreate({
    login: profile.username,
    id: profile._json.id,
    email: profile.emails[0].value,
    followers: profile._json.followers,
    avatar_url: profile._json.avatar_url
  }, (err, user) => {
    User.createStarGraph(user.login, accessToken, 0, (err, repos) => {
      if (err) console.log(err)
      console.log(`create/updated ${repos.length} repos`)
      return
    })
    User.createSocialGraph(user.login, accessToken, (err, results) => {
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
