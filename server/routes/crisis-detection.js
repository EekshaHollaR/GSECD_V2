const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const crisisDetectionService = require('../services/crisisDetectionService');

// @desc    Analyze country risk
// @route   GET /api/crisis-detection/country/:code
// @access  Private
router.get('/country/:code', protect, async (req, res) => {
  try {
    console.log(`Analyzing risk for country: ${req.params.code}`);
    const result = await crisisDetectionService.analyzeCountryRisk(req.params.code.toUpperCase());
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Country risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing country risk'
    });
  }
});

// @desc    Get global risk analysis
// @route   GET /api/crisis-detection/global
// @access  Private
router.get('/global', protect, async (req, res) => {
  try {
    console.log('Analyzing global risk...');
    const countries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'BRA', 'RUS', 'CAN'];
    const analyses = [];
    
    for (const countryCode of countries) {
      try {
        const analysis = await crisisDetectionService.analyzeCountryRisk(countryCode);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Error analyzing ${countryCode}:`, error);
        // Continue with other countries even if one fails
      }
    }
    
    console.log(`Global risk analysis completed for ${analyses.length} countries`);
    res.status(200).json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('Global risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing global risk'
    });
  }
});

module.exports = router;

// const express = require('express');
// const router  = express.Router();
// const { protect } = require('../middleware/auth');
// const detection = require('../services/crisisDetectionService');

// // GET /api/crisis-detection/country/:code
// router.get(
//   '/country/:code',
//   protect,
//   async (req, res) => {
//     try {
//       const result = await detection.analyzeCountryRisk(req.params.code);
//       res.json({ success: true, data: result });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ success:false, message:'Error analyzing country risk' });
//     }
//   }
// );

// // GET /api/crisis-detection/global
// router.get(
//   '/global',
//   protect,
//   async (req, res) => {
//     try {
//       const countries = ['USA','CHN','JPN','DEU','GBR','FRA','IND','BRA','RUS','CAN'];
//       const analyses = await Promise.all(
//         countries.map(code => detection.analyzeCountryRisk(code))
//       );
//       res.json({ success:true, data: analyses });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ success:false, message:'Error analyzing global risk' });
//     }
//   }
// );

// module.exports = router;
