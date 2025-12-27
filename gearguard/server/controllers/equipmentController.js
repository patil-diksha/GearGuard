const { Equipment, MaintenanceRequest, MaintenanceTeam, User } = require('../models')
const { Op } = require('sequelize')

const createEquipment = async (req, res) => {
  try {
    const equipmentData = req.body
    const equipment = await Equipment.create(equipmentData)
    
    res.status(201).json({
      message: 'Equipment created successfully',
      equipment
    })
  } catch (error) {
    console.error('Create equipment error:', error)
    res.status(500).json({ 
      message: 'Error creating equipment', 
      error: error.message 
    })
  }
}

const getAllEquipment = async (req, res) => {
  try {
    const { search, category, department, team } = req.query
    
    const whereClause = {}
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { serial_number: { [Op.iLike]: `%${search}%` } }
      ]
    }
    
    if (category) {
      whereClause.category = category
    }
    
    if (department) {
      whereClause.department_id = department
    }
    
    if (team) {
      whereClause.maintenance_team_id = team
    }

    const equipment = await Equipment.findAll({
      where: whereClause,
      include: [
        {
          model: MaintenanceTeam,
          as: 'maintenance_team',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'default_technician',
          attributes: ['id', 'full_name', 'username']
        },
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.json(equipment)
  } catch (error) {
    console.error('Get equipment error:', error)
    res.status(500).json({ 
      message: 'Error fetching equipment', 
      error: error.message 
    })
  }
}

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params
    
    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: MaintenanceTeam,
          as: 'maintenance_team',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'default_technician',
          attributes: ['id', 'full_name', 'username', 'email']
        },
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'username']
        }
      ]
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    res.json(equipment)
  } catch (error) {
    console.error('Get equipment by ID error:', error)
    res.status(500).json({ 
      message: 'Error fetching equipment', 
      error: error.message 
    })
  }
}

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    await equipment.update(updateData)

    res.json({
      message: 'Equipment updated successfully',
      equipment
    })
  } catch (error) {
    console.error('Update equipment error:', error)
    res.status(500).json({ 
      message: 'Error updating equipment', 
      error: error.message 
    })
  }
}

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    await equipment.destroy()

    res.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    console.error('Delete equipment error:', error)
    res.status(500).json({ 
      message: 'Error deleting equipment', 
      error: error.message 
    })
  }
}

const getEquipmentRequests = async (req, res) => {
  try {
    const { id } = req.params

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const requests = await MaintenanceRequest.findAll({
      where: { equipment_id: id },
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'serial_number']
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'username']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.json(requests)
  } catch (error) {
    console.error('Get equipment requests error:', error)
    res.status(500).json({ 
      message: 'Error fetching equipment requests', 
      error: error.message 
    })
  }
}

const getEquipmentStats = async (req, res) => {
  try {
    const { id } = req.params

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    const totalRequests = await MaintenanceRequest.count({
      where: { equipment_id: id }
    })

    const openRequests = await MaintenanceRequest.count({
      where: { 
        equipment_id: id,
        stage_id: { [Op.ne]: 4 } // Assuming 4 is Repaired stage
      }
    })

    const completedRequests = await MaintenanceRequest.count({
      where: { 
        equipment_id: id,
        stage_id: 4 // Repaired stage
      }
    })

    const scrapRequests = await MaintenanceRequest.count({
      where: { 
        equipment_id: id,
        stage_id: 5 // Scrap stage
      }
    })

    res.json({
      total_requests: totalRequests,
      open_requests: openRequests,
      completed_requests: completedRequests,
      scrap_requests: scrapRequests
    })
  } catch (error) {
    console.error('Get equipment stats error:', error)
    res.status(500).json({ 
      message: 'Error fetching equipment stats', 
      error: error.message 
    })
  }
}

module.exports = {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentRequests,
  getEquipmentStats
}
