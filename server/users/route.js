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
  if (data.message) {
    console.log('error from suggestions')
    res.json({msg: data.message})
  } else {
    res.json(data.payload)
  }
})

function getSuggestionsData (req, res, next) {
  console.log('getting suggestions')
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

export default router
