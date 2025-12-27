const jwt = require('jsonwebtoken')
const { User } = require('../models')

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { 
        $or: [{ username }, { email }] 
      }
    })

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this username or email already exists' 
      })
    }

    const user = await User.create({
      username,
      email,
      password,
      full_name,
      role: role || 'user'
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ where: { username } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers
}
