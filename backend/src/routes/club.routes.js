const express = require('express');
const {
  getClubs,
  getClubById,
  registerForClub,
  getStudentRegistrations
} = require('../controllers/club.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getClubs);
router.get('/registrations', protect, getStudentRegistrations);
router.get('/:id', getClubById);
router.post('/:id/register', protect, registerForClub);

module.exports = router;
