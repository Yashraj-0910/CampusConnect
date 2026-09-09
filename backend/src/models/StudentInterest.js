const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentInterest = sequelize.define('StudentInterest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  interest: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'student_interests',
  timestamps: true,
  underscored: true
});

module.exports = StudentInterest;
