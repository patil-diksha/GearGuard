const { MaintenanceRequest, Equipment, RequestStage, User, MaintenanceTeam } = require('../models')
const { Op } = require('sequelize')
const { Sequelize } = require('sequelize')

const createRequest = async (req, res) => {
  try {
    const { subject, description, request_type, priority, scheduled_date, equipment_id, technician_id } = req.body

    // Get equipment details for auto-fill logic
    const equipment = await Equipment.findByPk(equipment_id, {
      include: [
        { model: MaintenanceTeam, as: 'maintenance_team' }
      ]
    })

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' })
    }

    // Get the "New" stage (default stage)
    const newStage = await RequestStage.findOne({
      where: { name: 'New' }
    })

    if (!newStage) {
      return res.status(400).json({ message: 'Default stage not found' })
    }

    const requestData = {
      subject,
      description,
      request_type: request_type || 'corrective',
      priority: priority || 'medium',
      scheduled_date,
      equipment_id,
      technician_id: technician_id || equipment.default_technician_id,
      stage_id: newStage.id,
      created_by: req.user.id
    }

    // Check if overdue (for corrective requests)
    if (request_type === 'corrective' && !scheduled_date) {
      requestData.is_overdue = false
    } else if (scheduled_date && new Date(scheduled_date) < new Date()) {
      requestData.is_overdue = true
    }

    const request = await MaintenanceRequest.create(requestData)

    // Fetch the complete request with associations
    const completeRequest = await MaintenanceRequest.findByPk(request.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            { model: MaintenanceTeam, as: 'maintenance_team' }
          ]
        },
        {
          model: RequestStage,
          as: 'stage'
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
      ]
    })

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: completeRequest
    })
  } catch (error) {
    console.error('Create request error:', error)
    res.status(500).json({ 
      message: 'Error creating maintenance request', 
      error: error.message 
    })
  }
}

const getAllRequests = async (req, res) => {
  try {
    const { 
      search, 
      stage_id, 
      request_type, 
      priority, 
      equipment_id,
      technician_id,
      team_id,
      from_date,
      to_date
    } = req.query

    const whereClause = {}

    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (stage_id) {
      whereClause.stage_id = stage_id
    }

    if (request_type) {
      whereClause.request_type = request_type
    }

    if (priority) {
      whereClause.priority = priority
    }

    if (equipment_id) {
      whereClause.equipment_id = equipment_id
    }

    if (technician_id) {
      whereClause.technician_id = technician_id
    }

    if (from_date || to_date) {
      whereClause.scheduled_date = {}
      if (from_date) {
        whereClause.scheduled_date[Op.gte] = from_date
      }
      if (to_date) {
        whereClause.scheduled_date[Op.lte] = to_date
      }
    }

    const requests = await MaintenanceRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            { 
              model: MaintenanceTeam, 
              as: 'maintenance_team',
              required: team_id ? true : false,
              where: team_id ? { id: team_id } : {}
            }
          ]
        },
        {
          model: RequestStage,
          as: 'stage'
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
    console.error('Get requests error:', error)
    res.status(500).json({ 
      message: 'Error fetching maintenance requests', 
      error: error.message 
    })
  }
}

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params

    const request = await MaintenanceRequest.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            { model: MaintenanceTeam, as: 'maintenance_team' }
          ]
        },
        {
          model: RequestStage,
          as: 'stage'
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'username', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'email']
        }
      ]
    })

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' })
    }

    res.json(request)
  } catch (error) {
    console.error('Get request by ID error:', error)
    res.status(500).json({ 
      message: 'Error fetching maintenance request', 
      error: error.message 
    })
  }
}

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const request = await MaintenanceRequest.findByPk(id)

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' })
    }

    // Scrap logic
    if (updateData.stage_id) {
      const scrapStage = await RequestStage.findOne({ where: { name: 'Scrap' } })
      if (scrapStage && updateData.stage_id === scrapStage.id) {
        // Set equipment as inactive when request goes to Scrap
        await Equipment.update(
          { is_active: false },
          { where: { id: request.equipment_id } }
        )
        updateData.notes = (updateData.notes || '') + '\n\nEquipment marked as scrapped.'
      }

      // Set completed date when moved to Repaired
      const repairedStage = await RequestStage.findOne({ where: { name: 'Repaired' } })
      if (repairedStage && updateData.stage_id === repairedStage.id && !request.completed_date) {
        updateData.completed_date = new Date()
      }
    }

    await request.update(updateData)

    const updatedRequest = await MaintenanceRequest.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            { model: MaintenanceTeam, as: 'maintenance_team' }
          ]
        },
        {
          model: RequestStage,
          as: 'stage'
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
      ]
    })

    res.json({
      message: 'Maintenance request updated successfully',
      request: updatedRequest
    })
  } catch (error) {
    console.error('Update request error:', error)
    res.status(500).json({ 
      message: 'Error updating maintenance request', 
      error: error.message 
    })
  }
}

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params

    const request = await MaintenanceRequest.findByPk(id)

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' })
    }

    await request.destroy()

    res.json({ message: 'Maintenance request deleted successfully' })
  } catch (error) {
    console.error('Delete request error:', error)
    res.status(500).json({ 
      message: 'Error deleting maintenance request', 
      error: error.message 
    })
  }
}

const getRequestsByStage = async (req, res) => {
  try {
    const { stage_id } = req.params

    const requests = await MaintenanceRequest.findAll({
      where: { stage_id },
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            { model: MaintenanceTeam, as: 'maintenance_team' }
          ]
        },
        {
          model: RequestStage,
          as: 'stage'
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
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    })

    res.json(requests)
  } catch (error) {
    console.error('Get requests by stage error:', error)
    res.status(500).json({ 
      message: 'Error fetching maintenance requests by stage', 
      error: error.message 
    })
  }
}

const getCalendarRequests = async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    const whereClause = {
      scheduled_date: { [Op.ne]: null }
    }

    if (start_date && end_date) {
      whereClause.scheduled_date = {
        [Op.between]: [start_date, end_date]
      }
    }

    const requests = await MaintenanceRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'serial_number']
        },
        {
          model: RequestStage,
          as: 'stage'
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'username']
        }
      ],
      order: [['scheduled_date', 'ASC']]
    })

    res.json(requests)
  } catch (error) {
    console.error('Get calendar requests error:', error)
    res.status(500).json({ 
      message: 'Error fetching calendar requests', 
      error: error.message 
    })
  }
}

const updateOverdueStatus = async (req, res) => {
  try {
    // Update overdue status for all requests
    await MaintenanceRequest.update(
      { is_overdue: true },
      {
        where: {
          scheduled_date: { [Op.lt]: new Date() },
          stage_id: { [Op.ne]: Sequelize.literal('(SELECT id FROM request_stages WHERE name = "Repaired")') }
        }
      }
    )

    res.json({ message: 'Overdue status updated successfully' })
  } catch (error) {
    console.error('Update overdue status error:', error)
    res.status(500).json({ 
      message: 'Error updating overdue status', 
      error: error.message 
    })
  }
}

const getRequestStats = async (req, res) => {
  try {
    const { equipment_id, team_id } = req.query

    const whereClause = {}
    
    if (equipment_id) {
      whereClause.equipment_id = equipment_id
    }

    const totalRequests = await MaintenanceRequest.count({ where: whereClause })

    const requestsByStage = await MaintenanceRequest.findAll({
      attributes: [
        'stage_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['stage_id'],
      include: [{
        model: RequestStage,
        as: 'stage',
        attributes: ['name', 'color']
      }],
      where: whereClause
    })

    const requestsByType = await MaintenanceRequest.findAll({
      attributes: [
        'request_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['request_type'],
      where: whereClause
    })

    const requestsByPriority = await MaintenanceRequest.findAll({
      attributes: [
        'priority',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      where: whereClause
    })

    res.json({
      total_requests: totalRequests,
      by_stage: requestsByStage,
      by_type: requestsByType,
      by_priority: requestsByPriority
    })
  } catch (error) {
    console.error('Get request stats error:', error)
    res.status(500).json({ 
      message: 'Error fetching request statistics', 
      error: error.message 
    })
  }
}

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsByStage,
  getCalendarRequests,
  updateOverdueStatus,
  getRequestStats
}
