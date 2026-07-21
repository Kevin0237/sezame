require('dotenv').config()
const { createApp } = require('./src/app')
const { env } = require('./src/config/env')

const app = createApp()

app.listen(env.port, () => {
  console.log(`Sezame API listening on http://localhost:${env.port}`)
  console.log(`Health: http://localhost:${env.port}/api/health`)
  console.log(`API v1: http://localhost:${env.port}/api/v1`)
})
