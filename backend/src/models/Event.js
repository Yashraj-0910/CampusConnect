const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schedule: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prizes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizers: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  event_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  registration_deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
    defaultValue: 'upcoming',
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'events',
  timestamps: true,
  underscored: true
});

module.exports = Event;
