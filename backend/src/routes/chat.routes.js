const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All chat routes require authentication
router.use(authenticateToken);

// Direct conversation endpoints
router.get('/conversations', chatController.getConversations);
router.get('/direct/:recipientId', chatController.getDirectMessages);

// Club channel endpoints
router.get('/club/:clubId', chatController.getClubMessages);

// Send message
router.post('/send', chatController.sendMessage);

module.exports = router;
