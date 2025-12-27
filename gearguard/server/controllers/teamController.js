const { MaintenanceTeam, User } = require('../models')

const createTeam = async (req, res) => {
  try {
    const { name, description, member_ids } = req.body

    // Check if team with same name exists
    const existingTeam = await MaintenanceTeam.findOne({ where: { name } })
    if (existingTeam) {
      return res.status(400).json({ message: 'Team with this name already exists' })
    }

    const team = await MaintenanceTeam.create({
      name,
      description
    })

    // Add members if provided
    if (member_ids && member_ids.length > 0) {
      await team.setMembers(member_ids)
    }

    const teamWithMembers = await MaintenanceTeam.findByPk(team.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'full_name', 'username', 'email', 'role']
      }]
    })

    res.status(201).json({
      message: 'Team created successfully',
      team: teamWithMembers
    })
  } catch (error) {
    console.error('Create team error:', error)
    res.status(500).json({ 
      message: 'Error creating team', 
      error: error.message 
    })
  }
}

const getAllTeams = async (req, res) => {
  try {
    const teams = await MaintenanceTeam.findAll({
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'full_name', 'username', 'email', 'role']
      }],
      order: [['name', 'ASC']]
    })

    res.json(teams)
  } catch (error) {
    console.error('Get teams error:', error)
    res.status(500).json({ 
      message: 'Error fetching teams', 
      error: error.message 
    })
  }
}

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params

    const team = await MaintenanceTeam.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'full_name', 'username', 'email', 'role']
        }
      ]
    })

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    res.json(team)
  } catch (error) {
    console.error('Get team by ID error:', error)
    res.status(500).json({ 
      message: 'Error fetching team', 
      error: error.message 
    })
  }
}

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, member_ids } = req.body

    const team = await MaintenanceTeam.findByPk(id)

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    await team.update({ name, description })

    // Update members if provided
    if (member_ids !== undefined) {
      await team.setMembers(member_ids)
    }

    const updatedTeam = await MaintenanceTeam.findByPk(team.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'full_name', 'username', 'email', 'role']
      }]
    })

    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    })
  } catch (error) {
    console.error('Update team error:', error)
    res.status(500).json({ 
      message: 'Error updating team', 
      error: error.message 
    })
  }
}

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params

    const team = await MaintenanceTeam.findByPk(id)

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    // Remove all members first
    await team.setMembers([])

    await team.destroy()

    res.json({ message: 'Team deleted successfully' })
  } catch (error) {
    console.error('Delete team error:', error)
    res.status(500).json({ 
      message: 'Error deleting team', 
      error: error.message 
    })
  }
}

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const { user_id } = req.body

    const team = await MaintenanceTeam.findByPk(id)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    const user = await User.findByPk(user_id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await team.addMember(user)

    res.json({ message: 'Member added to team successfully' })
  } catch (error) {
    console.error('Add team member error:', error)
    res.status(500).json({ 
      message: 'Error adding team member', 
      error: error.message 
    })
  }
}

const removeTeamMember = async (req, res) => {
  try {
    const { id, user_id } = req.params

    const team = await MaintenanceTeam.findByPk(id)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    const user = await User.findByPk(user_id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await team.removeMember(user)

    res.json({ message: 'Member removed from team successfully' })
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(500).json({ 
      message: 'Error removing team member', 
      error: error.message 
    })
  }
}

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
}
