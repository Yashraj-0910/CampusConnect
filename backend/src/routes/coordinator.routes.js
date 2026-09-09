const express = require('express');
const {
  getCoordinatorClub,
  getClubApplicants,
  manageApplicant,
  createClubEvent,
  createClubAnnouncement
} = require('../controllers/coordinator.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('coordinator', 'admin'));

router.get('/my-club', getCoordinatorClub);
router.get('/clubs/:clubId/applicants', getClubApplicants);
router.put('/applications/:registrationId', manageApplicant);
router.post('/clubs/:clubId/events', createClubEvent);
router.post('/clubs/:clubId/announcements', createClubAnnouncement);

module.exports = router;
