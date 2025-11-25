const prisma = require('../lib/prisma')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function createUser(req, res) {
  const { username, email, password } = req.body || {}

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'username, email and password are required',
    })
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

  const user = await prisma.user.create({
    data: { username, email, password },
    select: { id: true, username: true, email: true, createdAt: true },
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
    select: { id: true, username: true, email: true, createdAt: true },
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
      createdAt: true,
      posts: { select: { id: true } },
    },
  })

  res.json(users)
}

async function loginUser(req, res) {
  //look up the database for a user with the given username
  let user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  })
  if (user) {
    if (user.password === req.body.password) {
      // payload
      let payload = {
        sub: user.id,
        email: user.email,
      }
      // create the token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            res.send('Fail to create token')
          } else {
          res.send({message: 'Successfully Logged in', token: token})
          }
        }
      )
      // send to user
    } else {
      res.send('Password is incorrect')
    }
   // res.send(user)
  } else {
    res.send('User Not Found')
  }
}

module.exports = {
  createUser,
  getUserById,
  getUsers,
  loginUser,
}
