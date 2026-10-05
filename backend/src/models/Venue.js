const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('Auditorium', 'Seminar Hall', 'Computer Lab', 'Open Amphitheatre', 'Conference Room', 'Sports Ground'),
    defaultValue: 'Seminar Hall'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: ['Projector', 'Air Conditioning', 'Sound System', 'Wi-Fi']
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'venues',
  timestamps: true,
  underscored: true
});

module.exports = Venue;
