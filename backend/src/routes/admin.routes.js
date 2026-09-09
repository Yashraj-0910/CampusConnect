const express = require('express');
const {
  getDashboardStats,
  assignCoordinator,
  getAllStudents,
  createClub,
  updateClub,
  deleteClub
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.post('/assign-coordinator', assignCoordinator);
router.post('/clubs', createClub);
router.put('/clubs/:id', updateClub);
router.delete('/clubs/:id', deleteClub);

module.exports = router;
