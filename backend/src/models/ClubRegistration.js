const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClubRegistration = sequelize.define('ClubRegistration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'waitlisted'),
    defaultValue: 'pending',
    allowNull: false
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statement_of_purpose: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  availability: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  applied_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'club_registrations',
  timestamps: true,
  underscored: true
});

module.exports = ClubRegistration;
