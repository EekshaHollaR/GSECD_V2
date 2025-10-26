const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Country = require('../models/Country');

router.get('/', protect, async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json({ success: true, data: countries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching countries' });
  }
});

module.exports = router;
