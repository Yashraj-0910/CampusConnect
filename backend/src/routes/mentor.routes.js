const express = require('express');
const {
  getMentors,
  askQuestion,
  answerQuestion,
  getMentorQuestions
} = require('../controllers/mentor.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getMentors);
router.get('/:id/questions', protect, getMentorQuestions);
router.post('/:id/questions', protect, askQuestion);
router.put('/questions/:qId/answer', protect, answerQuestion);

module.exports = router;
