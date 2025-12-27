require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { sequelize, RequestStage } = require('./models')

const app = express()

// Security middleware
app.use(helmet())

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Import routes
const authRoutes = require('./routes/authRoutes')
const equipmentRoutes = require('./routes/equipmentRoutes')
const teamRoutes = require('./routes/teamRoutes')
const requestRoutes = require('./routes/requestRoutes')

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/requests', requestRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// Initialize database and start server
const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log('Database connection established successfully')

    // Sync all models
    await sequelize.sync({ alter: true })
    console.log('Database models synchronized')

    // Create default request stages if they don't exist
    const stages = [
      { name: 'New', sequence: 1, color: '#3B82F6' },
      { name: 'In Progress', sequence: 2, color: '#F59E0B' },
      { name: 'Repaired', sequence: 3, color: '#10B981' },
      { name: 'Scrap', sequence: 4, color: '#EF4444' }
    ]

    for (const stage of stages) {
      await RequestStage.findOrCreate({
        where: { name: stage.name },
        defaults: stage
      })
    }
    console.log('Default request stages initialized')

  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 5000

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}).catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  await sequelize.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server')
  await sequelize.close()
  process.exit(0)
})
