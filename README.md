# OS.today

A list a of the GitHub repos you should be using.

## How it works
When you login to the app, it creates a graph of your starred repositories.
Next, it finds all the users you follow and their stars. Finally, it calculates which
projects your friends have starred but you haven't, and then sorts. This is how
medium works but with a time window.

## Known issues
 - Only considers last 30 friends and 30 stars. Need to modify `getStarred` and `getFollowing` to fetch `Link` headers from GitHub's API.
 - Really **needs a read/write queue** (have seen the Financial Times using this technique) and several other workers.

## Roadmap
  - Include your friends username's who starred the project. Like FB: 'Joe, Bob, and 5 other friends starred'
  - Throng (lightweight PM2)
  - RabbitMQ and worker dynos
  - About page
  - Track clicks and create `VIEWED` relations, remove these from suggestions?
  - Handle recency? Only look at recent stars over the past week / month?
  - Switch perspectives to another user. Since everything is public there is no reason
  why it wouldn't be possible. Imagine viewing Linus Torvalds's / Jake Wharton's suggestions? Would be cool.
  - Generate a daily newletter

### Requirements

  - git
  - Neo4j
  - Redis
  - Node.js
  - Heroku Toolbelt
  - Registered Github Application

### Development
Register a new github developer application. Copy the ID and Secret. We'll need them later.
Additionally, setup the callback URL's as follows:

<img width="558" alt="screenshot 2016-08-04 19 46 11" src="https://cloud.githubusercontent.com/assets/4060187/17422019/2e483afe-5a7c-11e6-80bd-03db5f65bb4c.png">


Next create a `.env` file in your project's root directory with the following inside:

```bash
GITHUB_CLIENT_ID=xxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_CALLBACK_URL=xxxxxxxxxxxxxxxxxx
SESSION_SECRET=xxxxxxxxxxxx
REDIS_URL=xxxxxxxxxxxxxxxxx
```

To run the app in development with webpack HMR:

```bash
heroku local -f Procfile.local
```

To run in production:

```bash
heroku local
```
