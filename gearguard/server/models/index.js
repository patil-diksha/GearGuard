const sequelize = require('../config/database')
const User = require('./User')
const Equipment = require('./Equipment')
const MaintenanceTeam = require('./MaintenanceTeam')
const RequestStage = require('./RequestStage')
const MaintenanceRequest = require('./MaintenanceRequest')

// Define associations

// User associations
User.hasMany(MaintenanceRequest, { foreignKey: 'technician_id', as: 'assigned_requests' })
User.hasMany(MaintenanceRequest, { foreignKey: 'created_by', as: 'created_requests' })
User.belongsToMany(MaintenanceTeam, { through: 'team_members', foreignKey: 'user_id', as: 'teams' })

// Equipment associations
Equipment.belongsTo(MaintenanceTeam, { foreignKey: 'maintenance_team_id', as: 'maintenance_team' })
Equipment.belongsTo(User, { foreignKey: 'default_technician_id', as: 'default_technician' })
Equipment.hasMany(MaintenanceRequest, { foreignKey: 'equipment_id', as: 'requests' })

// MaintenanceTeam associations
MaintenanceTeam.hasMany(Equipment, { foreignKey: 'maintenance_team_id', as: 'equipment' })
MaintenanceTeam.belongsToMany(User, { through: 'team_members', foreignKey: 'team_id', as: 'members' })

// RequestStage associations
RequestStage.hasMany(MaintenanceRequest, { foreignKey: 'stage_id', as: 'requests' })

// MaintenanceRequest associations
MaintenanceRequest.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' })
MaintenanceRequest.belongsTo(RequestStage, { foreignKey: 'stage_id', as: 'stage' })
MaintenanceRequest.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' })
MaintenanceRequest.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

module.exports = {
  sequelize,
  User,
  Equipment,
  MaintenanceTeam,
  RequestStage,
  MaintenanceRequest
}
