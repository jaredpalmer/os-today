import express from 'express'
import jackrabbit from 'jackrabbit'
import config from '../config'

const { Router } = express
const router = new Router()

const rabbit = jackrabbit(config.rabbitmqURL)
const exchange = rabbit.default()

/**
 * POST Extract content from url.
 */
router.get('/feed/:page', getSuggestionsData, (req, res, next) => {
  const data = res.locals.data
  if (data.error) {
    next(data.payload)
  } else {
    res.json(data.payload)
  }
})

function getSuggestionsData (req, res, next) {
  const skip = req.params.page ? req.params.page * 50 : 0
  exchange.publish({ login: req.user.login, skip }, {
    expiration: config.serviceTime,
    key: 'users.getSuggestions',
    reply: (data) => {
      res.locals.data = data
      next()
    }
  })
}

router.get('/refresh/social', (req, res, next) => {
  exchange.publish({ login: req.user.login, token: req.user.token }, {
    key: 'users.createStarGraph'
  })
  exchange.publish({ login: req.user.login, token: req.user.token }, {
    key: 'users.createSocialGraph',
    reply (data) {
      console.log(data.payload.length)
      data.payload.forEach(n => {
        // Make their star graphs
        exchange.publish({login: n.login, token: req.user.token}, {
          key: 'users.createStarGraph'
        })
      })
    }
  })
  res.json({
    msg: 'requested refresh'
  })
})

export default router
