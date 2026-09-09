const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('registered', 'attended'),
    defaultValue: 'registered',
    allowNull: false
  },
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'event_registrations',
  timestamps: true,
  underscored: true
});

module.exports = EventRegistration;
