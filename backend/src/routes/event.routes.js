const express = require('express');
const {
  getEvents,
  getEventById,
  registerForEvent,
  getRegisteredEvents
} = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getEvents);
router.get('/registered', protect, getRegisteredEvents);
router.get('/:id', getEventById);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;
