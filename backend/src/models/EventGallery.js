const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventGallery = sequelize.define('EventGallery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'event_gallery',
  timestamps: true,
  underscored: true
});

module.exports = EventGallery;
