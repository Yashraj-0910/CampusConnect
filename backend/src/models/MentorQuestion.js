const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MentorQuestion = sequelize.define('MentorQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  mentor_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  asked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  answered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mentor_questions',
  timestamps: false,
  underscored: true
});

module.exports = MentorQuestion;
