const express = require('express');
const { getFAQs } = require('../controllers/faq.controller');

const router = express.Router();

router.get('/', getFAQs);

module.exports = router;
