const express = require('express')
const path = require('path')
const routes = require('./routes')
const { authenticate } = require('./middleware/auth')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(authenticate)

app.use('/ui', express.static(path.join(__dirname, '..', 'public')))
app.use(routes)

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
