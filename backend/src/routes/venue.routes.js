const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Public / Authenticated discovery
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);

// Coordinator / User booking actions
router.post('/book', authenticateToken, venueController.requestBooking);
router.get('/my/bookings', authenticateToken, venueController.getMyBookings);

// Admin review actions
router.get('/admin/requests', authenticateToken, requireRole('admin'), venueController.getAdminBookings);
router.put('/admin/requests/:id', authenticateToken, requireRole('admin'), venueController.updateBookingStatus);

module.exports = router;
