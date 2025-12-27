const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  request_type: {
    type: DataTypes.ENUM('corrective', 'preventive'),
    allowNull: false,
    defaultValue: 'corrective'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Duration in hours'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_overdue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'request_stages',
      key: 'id'
    }
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['equipment_id']
    },
    {
      fields: ['stage_id']
    },
    {
      fields: ['scheduled_date']
    }
  ]
})

module.exports = MaintenanceRequest
