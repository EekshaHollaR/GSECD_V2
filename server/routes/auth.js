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

router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', validateUserLogin, handleValidationErrors, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

router.get('/debug', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Auth working',
    user: req.user
  });
});
