const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { auth, authorize } = require('../middleware/auth')
const { register, login, getProfile, getAllUsers } = require('../controllers/authController')

// Validation middleware
const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
]

const validateRegister = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

// Public routes
router.post('/login', validateLogin, login)
router.post('/register', validateRegister, register)

// Protected routes
router.get('/profile', auth, getProfile)
router.get('/users', auth, authorize('admin', 'manager'), getAllUsers)

module.exports = router
