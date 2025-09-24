const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAlerts,
  acknowledgeAlert
} = require('../controllers/alerts');

// @desc    Get all alerts with optional filtering
// @route   GET /api/alerts
// @access  Private
router.get('/', protect, getAlerts);

// @desc    Acknowledge an alert (mark inactive)
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
router.put('/:id/acknowledge', protect, acknowledgeAlert);

module.exports = router;
