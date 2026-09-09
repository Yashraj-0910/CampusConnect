const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.ENUM('cultural', 'technical', 'sports', 'literary', 'social', 'entrepreneurship', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  activities: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  beginners_allowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  recruitment_process: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registration_status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'closed'
  },
  registration_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  max_members: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clubs',
  timestamps: true,
  underscored: true
});

module.exports = Club;
