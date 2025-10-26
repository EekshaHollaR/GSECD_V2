// server/routes/analysis.js
const express = require('express');
const { getCorrelationMatrix } = require('../controllers/analysis');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/correlation', protect, getCorrelationMatrix);

module.exports = router;