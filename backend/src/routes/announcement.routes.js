const express = require('express');
const { getAnnouncements, createAnnouncement } = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getAnnouncements);
router.post('/', protect, authorize('coordinator', 'admin'), createAnnouncement);

module.exports = router;
