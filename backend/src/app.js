const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const apiRoutes = require('./routes')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Sezame API is running' })
  })

  app.use('/api/v1', apiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
