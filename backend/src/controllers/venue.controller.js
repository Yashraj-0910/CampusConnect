const { Op } = require('sequelize');
const { Venue, VenueBooking, Club, User, Event } = require('../models');
const { sendNotificationToUser } = require('../sockets/socket.handler');

// Helper to check if two time ranges overlap (Format HH:MM)
const isTimeOverlapping = (startA, endA, startB, endB) => {
  return (startA < endB && endA > startB);
};

// 1. Get all venues
exports.getAllVenues = async (req, res) => {
  try {
    const { type, min_capacity, search } = req.query;
    const where = { is_active: true };

    if (type) where.type = type;
    if (min_capacity) where.capacity = { [Op.gte]: parseInt(min_capacity, 10) };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const venues = await Venue.findAll({
      where,
      order: [['capacity', 'DESC']]
    });

    res.json({ success: true, venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues.' });
  }
};

// 2. Get single venue with schedule for a specific date
exports.getVenueById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const venue = await Venue.findByPk(id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    const bookingWhere = {
      venue_id: id,
      status: 'approved'
    };

    if (date) {
      bookingWhere.booking_date = date;
    } else {
      bookingWhere.booking_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    }

    const bookings = await VenueBooking.findAll({
      where: bookingWhere,
      include: [
        { model: Club, attributes: ['id', 'name', 'logo_url'] },
        { model: User, attributes: ['id', 'name'] }
      ],
      order: [['booking_date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({ success: true, venue, bookings });
  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venue details.' });
  }
};

// 3. Request a venue booking (Coordinator / Admin / Student Lead)
exports.requestBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { venue_id, club_id, event_id, booking_date, start_time, end_time, purpose, expected_attendees } = req.body;

    if (!venue_id || !booking_date || !start_time || !end_time || !purpose) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ success: false, message: 'End time must be later than start time.' });
    }

    // Check if venue exists
    const venue = await Venue.findByPk(venue_id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    // Check for conflicting approved bookings on that date
    const existingApprovedBookings = await VenueBooking.findAll({
      where: {
        venue_id,
        booking_date,
        status: 'approved'
      }
    });

    for (const b of existingApprovedBookings) {
      if (isTimeOverlapping(start_time, end_time, b.start_time, b.end_time)) {
        return res.status(409).json({
          success: false,
          message: `Slot conflict! Venue is already booked on ${booking_date} from ${b.start_time} to ${b.end_time} for: "${b.purpose}".`
        });
      }
    }

    // If user is admin, auto-approve; otherwise set to pending
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const booking = await VenueBooking.create({
      venue_id,
      club_id: club_id || null,
      user_id: userId,
      event_id: event_id || null,
      booking_date,
      start_time,
      end_time,
      purpose,
      expected_attendees: expected_attendees || 50,
      status: initialStatus,
      admin_notes: req.user.role === 'admin' ? 'Auto-approved by Administrator' : null
    });

    const populatedBooking = await VenueBooking.findByPk(booking.id, {
      include: [
        { model: Venue },
        { model: Club, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Venue booked and approved successfully.' : 'Venue booking request submitted for Admin review.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error submitting venue booking:', error);
    res.status(500).json({ success: false, message: 'Failed to request venue booking.' });
  }
};

// 4. Get bookings for logged-in user / coordinator
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await VenueBooking.findAll({
      where: { user_id: userId },
      include: [
        { model: Venue },
        { model: Club, attributes: ['id', 'name', 'logo_url'] },
        { model: Event, attributes: ['id', 'title'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your bookings.' });
  }
};

// 5. Admin: Get all venue booking requests
exports.getAdminBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const bookings = await VenueBooking.findAll({
      where,
      include: [
        { model: Venue },
        { model: Club, attributes: ['id', 'name', 'logo_url'] },
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Event, attributes: ['id', 'title'] }
      ],
      order: [['booking_date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking requests.' });
  }
};

// 6. Admin: Update booking status (Approve / Reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const booking = await VenueBooking.findByPk(id, {
      include: [{ model: Venue }, { model: User }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // If approving, make sure no other approved booking clashes
    if (status === 'approved') {
      const clashes = await VenueBooking.findAll({
        where: {
          venue_id: booking.venue_id,
          booking_date: booking.booking_date,
          status: 'approved',
          id: { [Op.ne]: booking.id }
        }
      });

      for (const b of clashes) {
        if (isTimeOverlapping(booking.start_time, booking.end_time, b.start_time, b.end_time)) {
          return res.status(409).json({
            success: false,
            message: `Cannot approve! Venue is already booked from ${b.start_time} to ${b.end_time}.`
          });
        }
      }
    }

    booking.status = status;
    if (admin_notes !== undefined) booking.admin_notes = admin_notes;
    await booking.save();

    // Send real-time notification to requester
    sendNotificationToUser(booking.user_id, {
      type: 'venue_status',
      title: `Venue Request ${status.toUpperCase()}`,
      message: `Your booking for ${booking.Venue.name} on ${booking.booking_date} has been ${status}.`,
      data: { booking_id: booking.id, status }
    });

    res.json({
      success: true,
      message: `Booking has been ${status}.`,
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};
