import passport from 'passport'
import GitHubStrategy from 'passport-github'
import * as User from './models/user'

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  console.log(accessToken)
  console.log(profile)
  User.findOrCreate({ login: profile.username, id: parseInt(profile.id) }, (err, user) => {
    if (err) done(err, null)
    console.log(user)
    // user.token = accessToken

    User.createStarGraph(user.login, accessToken, (err, repo) => {
      if (err) done(err, null)
    })

    User.createSocialGraph(user.login, accessToken, (err, repo) => {
      if (err) done(err, null)
    })

    done(null, user)
  })
}))

export default passport
