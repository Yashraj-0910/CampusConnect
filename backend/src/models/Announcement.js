const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('general', 'club', 'event', 'important', 'opportunity'),
    defaultValue: 'general',
    allowNull: false
  },
  is_important: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'announcements',
  timestamps: true,
  underscored: true
});

module.exports = Announcement;
