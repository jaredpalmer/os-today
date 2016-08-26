import http from 'http'
import jackrabbit from 'jackrabbit'
import throng from 'throng'
import logger from 'logfmt'
import * as User from './model'
import config from '../config'

http.globalAgent.maxSockets = Infinity

throng({
  workers: config.webConcurrency,
  lifetime: Infinity,
  start
})

function start () {
  const rabbit = jackrabbit(config.rabbitmqURL)
  const exchange = rabbit.default()
  logger.log({ type: 'info', message: 'serving users-rw service' })

  exchange
    .queue({ name: 'users.findByUsername' })
    .consume(onFindByUsername)

  exchange
    .queue({ name: 'users.findOrCreate', durable: true })
    .consume(onFindOrCreate)

  exchange
    .queue({ name: 'users.getSuggestions', durable: true })
    .consume(onGetSuggestions)

  exchange
    .queue({ name: 'users.createStarGraph', durable: true })
    .consume(onCreateStarGraph)

  exchange
    .queue({ name: 'users.createSocialGraph', durable: true })
    .consume(onCreateSocialGraph)

  process.on('SIGTERM', process.exit)
  process.once('uncaughtException', onError)

  function onFindByUsername (message, reply) {
    logger.log(message)
    const timer = logger.time('users.findByUsername').namespace(message)

    User.findByUsername(message.login, (err, user) => {
      timer.log()
      if (err) {
        reply({
          type: 'users.findByUsername',
          error: true,
          payload: err,
          message: err.message || 'Could not find by username'
        })
      } else {
        reply({
          type: 'users.findByUsername',
          payload: user
        })
      }
    })
  }

  function onFindOrCreate (message, reply) {
    logger.log(message)
    const timer = logger.time('users.findOrCreate').namespace(message)
    const { login, id, email, followers, avatar_url, token } = message
    User.findOrCreate({login, id, email, followers, avatar_url, token}, (err, user) => {
      timer.log()
      if (err) {
        reply({
          type: 'users.findOrCreate',
          error: true,
          payload: err,
          message: err.message || 'Could not find or create user'
        })
      } else {
        reply({
          type: 'users.findOrCreate',
          payload: user
        })
      }
    })
  }

  function onGetSuggestions (message, reply) {
    logger.log(message)
    const timer = logger.time('users.getSuggestions').namespace(message)
    const { login, skip } = message
    User.getSuggestions(login, skip, (err, repos) => {
      timer.log()
      if (err) {
        reply({
          type: 'users.getSuggestions',
          error: true,
          payload: err,
          message: err.message || 'Could not get suggestions from db'
        })
      } else {
        reply({
          type: 'users.getSuggestions',
          payload: repos
        })
      }
    })
  }

  function onCreateStarGraph (message, reply) {
    logger.log(message)
    const timer = logger.time('users.createStarGraph').namespace(message)
    const { login, token } = message
    User.createStarGraph(login, token, (err, repos) => {
      timer.log()
      if (err) {
        logger.error(err)
        reply({
          type: 'users.createStarGraph',
          error: true,
          payload: err,
          message: err.message || 'Could not get create star graph'
        })
      } else {
        reply({
          type: 'users.createStarGraph',
          payload: repos
        })
      }
    })
  }

  // TODO(jlp): make this non-locking
  function onCreateSocialGraph (message, reply) {
    logger.log(message)
    const timer = logger.time('users.createSocialGraph').namespace(message)
    const followtimer = logger.time('users.getFollowing').namespace(message)
    const { login, token } = message
    User.getFollowing(login, token, (err, friendList) => {
      followtimer.log()
      if (err) {
        reply({
          type: 'users.createSocialGraph',
          error: true,
          payload: err,
          message: err.message || 'Could not create social graph'
        })
      } else {
        const friends = friendList.map(f => ({
          login: f.login,
          id: f.id,
          avatar_url: f.avatar_url
        }))

        // Add them to the graph
        User.findOrCreateUsersAndFollow(message.login, friends, (err, newFriends) => {
          timer.log()
          if (err) {
            logger.error(err)
            reply({
              type: 'users.createSocialGraph',
              error: true,
              payload: err,
              message: err.message || 'Could not create social graph'
            })
          } else {
            reply({
              type: 'users.createSocialGraph',
              payload: newFriends
            })
          }
        })
      }
    })
  }

  function onError (err) {
    logger.log({
      type: 'error',
      service: 'users-rw',
      error: err,
      stack: err.stack || 'No stacktrace'
    }, process.stderr)
    logger.log({ type: 'info', message: 'killing users-rw' })
    process.exit()
  }
}
