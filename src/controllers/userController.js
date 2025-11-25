const prisma = require('../lib/prisma')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const ALLOWED_ROLES = ['USER', 'ADMIN']

async function createUser(req, res) {
  const { username, email, password } = req.body || {}

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'username, email and password are required',
    })
  }

  const requestedRole = req.body.role ? String(req.body.role).toUpperCase() : 'USER'
  if (!ALLOWED_ROLES.includes(requestedRole)) {
    return res.status(400).json({ error: 'role must be one of: USER, ADMIN' })
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existing) {
    return res
      .status(409)
      .json({ error: 'User with that email already exists' })
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 10)
  } catch (err) {
    console.error('Failed to hash password', err)
    return res.status(500).json({ error: 'Failed to create user' })
  }

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, role: requestedRole },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  })

  res.status(201).json(user)
}

async function getUserById(req, res) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'User id must be a number' })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user)
}

async function getUsers(req, res) {
  const take = req.query.take ? Number(req.query.take) : 100
  const skip = req.query.skip ? Number(req.query.skip) : 0

  if (
    (req.query.take && (Number.isNaN(take) || take <= 0)) ||
    (req.query.skip && (Number.isNaN(skip) || skip < 0))
  ) {
    return res
      .status(400)
      .json({ error: 'take must be > 0 and skip must be >= 0' })
  }

  const users = await prisma.user.findMany({
    take,
    skip,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      posts: { select: { id: true } },
    },
  })

  res.json(users)
}

async function loginUser(req, res) {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'username and password are required to login' })
  }

  //look up the database for a user with the given username
  let user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(404).json({ error: 'User Not Found' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ error: 'Password is incorrect' })
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  }

  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
    if (err) {
      console.error('Failed to create token', err)
      return res.status(500).json({ error: 'Fail to create token' })
    }

    return res.json({ message: 'Successfully Logged in', token })
  })
}

module.exports = {
  createUser,
  getUserById,
  getUsers,
  loginUser,
}
