const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VenueBooking = sequelize.define('VenueBooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'HH:MM format, e.g. 10:00'
  },
  end_time: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'HH:MM format, e.g. 13:00'
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expected_attendees: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'venue_bookings',
  timestamps: true,
  underscored: true
});

module.exports = VenueBooking;
