const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClubMember = sequelize.define('ClubMember', {
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
  role: {
    type: DataTypes.ENUM('member', 'core_team'),
    defaultValue: 'member',
    allowNull: false
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'club_members',
  timestamps: true,
  underscored: true
});

module.exports = ClubMember;
