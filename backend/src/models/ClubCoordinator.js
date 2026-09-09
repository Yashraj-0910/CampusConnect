const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClubCoordinator = sequelize.define('ClubCoordinator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role_title: {
    type: DataTypes.STRING,
    defaultValue: 'Coordinator'
  }
}, {
  tableName: 'club_coordinators',
  timestamps: true,
  underscored: true
});

module.exports = ClubCoordinator;
