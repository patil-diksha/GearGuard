const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const RequestStage = sequelize.define('RequestStage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  sequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6B7280'
  }
}, {
  tableName: 'request_stages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = RequestStage
