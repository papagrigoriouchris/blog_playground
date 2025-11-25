const express = require('express')
const path = require('path')
const routes = require('./routes')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use((req, res, next) => {
  // Public paths (UI assets, login, health)
  if (
    req.path === '/users/login' ||
    req.path === '/' ||
    req.path.startsWith('/ui') ||
    req.method === 'OPTIONS'
  ) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).send('Missing Authorization Header')

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(400).send('Missing Bearer. wrong format')
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set')
    return res.status(500).send('Server misconfiguration')
  }

  const token = authHeader.slice(7).trim().replace(/^"|"$/g, '')
  if (!token || token.includes(' ')) {
    console.error('Token received is empty or contains spaces:', token)
    return res.status(400).send('Missing or empty token')
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify failed:', err.message)
      return res.status(401).send(`token is invalid: ${err.message}`)
    }
    req.jwtData = decoded
    return next()
  })
})

app.use('/ui', express.static(path.join(__dirname, '..', 'public')))
app.use(routes)

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
