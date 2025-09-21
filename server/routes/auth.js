const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} = require('../middleware/validation');


const router = express.Router();

// Apply auth rate limiter to all routes
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
