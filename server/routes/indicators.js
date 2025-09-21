const express = require('express');
const {
  getEconomicIndicators,
  getIndicatorsByCountry,
  getIndicatorsByCategory,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getIndicatorTrends,
  compareCountries
} = require('../controllers/indicators');
const { protect, authorize } = require('../middleware/auth');
const { dataLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply data rate limiter
router.use(dataLimiter);

// Public routes (with authentication)
router.use(protect);

router
  .route('/')
  .get(getEconomicIndicators)
  .post(authorize('admin', 'analyst'), createIndicator);

router.get('/country/:countryCode', getIndicatorsByCountry);
router.get('/category/:category', getIndicatorsByCategory);
router.get('/trends/:indicatorCode', getIndicatorTrends);
router.post('/compare', compareCountries);

router
  .route('/:id')
  .put(authorize('admin', 'analyst'), updateIndicator)
  .delete(authorize('admin'), deleteIndicator);

module.exports = router;
