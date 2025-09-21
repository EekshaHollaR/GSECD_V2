const express = require('express');
const {
  getCrisisEvents,
  getCrisisById,
  createCrisisEvent,
  updateCrisisEvent,
  deleteCrisisEvent,
  getCrisisByCountry,
  getActiveCrises,
  getCrisisTimeline
} = require('../controllers/crisis');
const { protect, authorize } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply general rate limiter
router.use(generalLimiter);
router.use(protect);

router
  .route('/')
  .get(getCrisisEvents)
  .post(authorize('admin', 'analyst'), createCrisisEvent);

router.get('/active', getActiveCrises);
router.get('/country/:countryCode', getCrisisByCountry);
router.get('/timeline', getCrisisTimeline);

router
  .route('/:id')
  .get(getCrisisById)
  .put(authorize('admin', 'analyst'), updateCrisisEvent)
  .delete(authorize('admin'), deleteCrisisEvent);

module.exports = router;
