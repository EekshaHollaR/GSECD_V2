const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSocialIndicators,
  createSocialIndicator
} = require('../controllers/socialIndicators');

router.route('/')
  .get(protect, getSocialIndicators)
  .post(protect, createSocialIndicator);

module.exports = router;
