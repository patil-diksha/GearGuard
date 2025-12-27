const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentRequests,
  getEquipmentStats
} = require('../controllers/equipmentController')

// All routes require authentication
router.use(auth)

// Equipment CRUD routes
router.post('/', createEquipment)
router.get('/', getAllEquipment)
router.get('/:id', getEquipmentById)
router.put('/:id', updateEquipment)
router.delete('/:id', deleteEquipment)

// Equipment-specific routes
router.get('/:id/requests', getEquipmentRequests)
router.get('/:id/stats', getEquipmentStats)

module.exports = router
