const jwt = require('jsonwebtoken')

const PUBLIC_ROUTES = [
  { path: '/', method: 'GET' },
  { path: '/users/login', method: 'POST' },
  { path: '/users', method: 'POST' },
]

function isPublic(req) {
  if (req.method === 'OPTIONS') return true
  if (req.path.startsWith('/ui')) return true
  return PUBLIC_ROUTES.some(
    (route) => req.path === route.path && req.method === route.method
  )
}

function authenticate(req, res, next) {
  if (isPublic(req)) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization Header' })

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Missing Bearer. wrong format' })
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const token = authHeader.slice(7).trim().replace(/^"|"$/g, '')
  if (!token || token.includes(' ')) {
    console.error('Token received is empty or contains spaces:', token)
    return res.status(400).json({ error: 'Missing or empty token' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify failed:', err.message)
      return res.status(401).json({ error: `token is invalid: ${err.message}` })
    }
    req.user = decoded
    req.jwtData = decoded
    return next()
  })
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' })
    }

    return next()
  }
}

module.exports = { authenticate, requireRoles }
