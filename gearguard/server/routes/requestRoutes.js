const express = require('express')
const router = express.Router()
const { auth, authorize } = require('../middleware/auth')
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsByStage,
  getCalendarRequests,
  updateOverdueStatus,
  getRequestStats
} = require('../controllers/requestController')

// All routes require authentication
router.use(auth)

// Request CRUD routes
router.post('/', createRequest)
router.get('/', getAllRequests)
router.get('/stats', getRequestStats)
router.get('/calendar', getCalendarRequests)
router.post('/overdue/update', authorize('admin', 'manager'), updateOverdueStatus)
router.get('/:id', getRequestById)
router.put('/:id', updateRequest)
router.delete('/:id', authorize('admin', 'manager'), deleteRequest)

// Request by stage route (for Kanban board)
router.get('/stage/:stage_id', getRequestsByStage)

module.exports = router
