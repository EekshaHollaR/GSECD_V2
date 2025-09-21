const express = require('express');
const {
  fetchWorldBankData,
  fetchIMFData,
  fetchFREDData,
  syncAllDataSources,
  getDataSourceStatus
} = require('../controllers/externalData');
const { protect, authorize } = require('../middleware/auth');
const { dataLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply data rate limiter and authentication
router.use(dataLimiter);
router.use(protect);

// Data fetching routes (admin/analyst only)
router.post('/world-bank/sync', authorize('admin', 'analyst'), fetchWorldBankData);
router.post('/imf/sync', authorize('admin', 'analyst'), fetchIMFData);
router.post('/fred/sync', authorize('admin', 'analyst'), fetchFREDData);
router.post('/sync-all', authorize('admin'), syncAllDataSources);

// Status checking (all authenticated users)
router.get('/status', getDataSourceStatus);

module.exports = router;
