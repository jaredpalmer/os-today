'use strict'

const config = {
  nodeEnv: process.env.NODE_ENV,
  sessionSecret: process.env.SESSION_SECRET || 'keyboard cat2',
  webConcurrency: process.env.WEB_CONCURRENCY || 1,
  port: process.env.PORT || 5000,
  serviceTime: process.env.SERVICE_TIME || 5000,
  timeout: 29000,
  redisURL: process.env.REDIS_URL || 'redis://localhost:6379',
  neo4jURL: process.env.GRAPHENEDB_URL || 'http://neo4j:neo5j@localhost:7474',
  rabbitmqURL: process.env.CLOUDAMQP_URL || 'amqp://guest:guest@localhost:5672'
}

module.exports = config
