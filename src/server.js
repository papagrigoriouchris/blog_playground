const app = require('./app')
const prisma = require('./lib/prisma')
const { ensureLogFile } = require('./utils/logger')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await ensureLogFile()
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
