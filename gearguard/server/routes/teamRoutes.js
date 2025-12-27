const express = require('express')
const router = express.Router()
const { auth, authorize } = require('../middleware/auth')
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} = require('../controllers/teamController')

// All routes require authentication
router.use(auth)

// Team CRUD routes
router.post('/', authorize('admin', 'manager'), createTeam)
router.get('/', getAllTeams)
router.get('/:id', getTeamById)
router.put('/:id', authorize('admin', 'manager'), updateTeam)
router.delete('/:id', authorize('admin', 'manager'), deleteTeam)

// Team member routes
router.post('/:id/members', authorize('admin', 'manager'), addTeamMember)
router.delete('/:id/members/:user_id', authorize('admin', 'manager'), removeTeamMember)

module.exports = router
