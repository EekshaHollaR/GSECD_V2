const worldBankService = require('../services/worldBankService');
const imfService = require('../services/imfService');
const EconomicIndicator = require('../models/EconomicIndicator');

// @desc    Fetch and sync World Bank data
// @route   POST /api/external-data/world-bank/sync
// @access  Private (Admin/Analyst)
exports.fetchWorldBankData = async (req, res) => {
  try {
    const { countries, indicators } = req.body;
    
    if (!countries || !indicators || countries.length === 0 || indicators.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Countries and indicators are required'
      });
    }

    console.log(`Starting World Bank data sync for ${countries.length} countries and ${indicators.length} indicators`);

    const results = [];
    
    for (const indicator of indicators) {
      try {
        const data = await worldBankService.fetchIndicatorData(
          indicator,
          countries.join(';')
        );
        
        const saveResult = await worldBankService.saveIndicators(data);
        
        results.push({
          indicator,
          success: true,
          recordsProcessed: data.length,
          recordsSaved: saveResult.inserted
        });
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to sync World Bank indicator ${indicator}:`, error);
        results.push({
          indicator,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + (r.recordsSaved || 0), 0);

    res.status(200).json({
      success: true,
      message: `World Bank sync completed: ${successCount}/${indicators.length} indicators synced`,
      data: {
        results,
        summary: {
          totalIndicators: indicators.length,
          successfulIndicators: successCount,
          totalRecords: totalRecords
        }
      }
    });
  } catch (error) {
    console.error('World Bank sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during World Bank data sync'
    });
  }
};

// @desc    Fetch and sync IMF data
// @route   POST /api/external-data/imf/sync
// @access  Private (Admin/Analyst)
exports.fetchIMFData = async (req, res) => {
  try {
    const { countries, indicators } = req.body;
    
    if (!countries || !indicators || countries.length === 0 || indicators.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Countries and indicators are required'
      });
    }

    console.log(`Starting IMF data sync for ${countries.length} countries and ${indicators.length} indicators`);

    const results = [];
    
    for (const indicator of indicators) {
      try {
        const data = await imfService.fetchIndicatorData(indicator, countries);
        const saveResult = await imfService.saveIndicators(data);
        
        results.push({
          indicator,
          success: true,
          recordsProcessed: data.length,
          recordsSaved: saveResult.inserted
        });
        
        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to sync IMF indicator ${indicator}:`, error);
        results.push({
          indicator,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + (r.recordsSaved || 0), 0);

    res.status(200).json({
      success: true,
      message: `IMF sync completed: ${successCount}/${indicators.length} indicators synced`,
      data: {
        results,
        summary: {
          totalIndicators: indicators.length,
          successfulIndicators: successCount,
          totalRecords: totalRecords
        }
      }
    });
  } catch (error) {
    console.error('IMF sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during IMF data sync'
    });
  }
};

// @desc    Fetch FRED data (placeholder - requires API key)
// @route   POST /api/external-data/fred/sync
// @access  Private (Admin/Analyst)
exports.fetchFREDData = async (req, res) => {
  try {
    // FRED API requires API key - this is a placeholder implementation
    res.status(501).json({
      success: false,
      message: 'FRED API integration not yet implemented. Please obtain API key from FRED first.'
    });
  } catch (error) {
    console.error('FRED sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during FRED data sync'
    });
  }
};

// @desc    Sync all data sources
// @route   POST /api/external-data/sync-all
// @access  Private (Admin)
exports.syncAllDataSources = async (req, res) => {
  try {
    const defaultCountries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'BRA'];
    
    console.log('Starting comprehensive data sync...');

    // World Bank sync
    const wbResults = await worldBankService.syncKeyIndicators(defaultCountries);
    
    // Wait 5 seconds between services
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // IMF sync (convert country codes to IMF format)
    const imfCountries = defaultCountries.map(code => {
      const mapping = { 'USA': 'US', 'CHN': 'CN', 'JPN': 'JP', 'DEU': 'DE', 'GBR': 'GB', 'FRA': 'FR', 'IND': 'IN', 'BRA': 'BR' };
      return mapping[code] || code;
    });
    
    const imfResults = await imfService.syncKeyIndicators(imfCountries);

    res.status(200).json({
      success: true,
      message: 'Comprehensive data sync completed',
      data: {
        worldBank: {
          results: wbResults,
          successful: wbResults.filter(r => r.success).length,
          total: wbResults.length
        },
        imf: {
          results: imfResults,
          successful: imfResults.filter(r => r.success).length,
          total: imfResults.length
        }
      }
    });
  } catch (error) {
    console.error('Comprehensive sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comprehensive data sync'
    });
  }
};

// @desc    Get data source status
// @route   GET /api/external-data/status
// @access  Private
exports.getDataSourceStatus = async (req, res) => {
  try {
    // Get indicator counts by source
    const sourceStats = await EconomicIndicator.aggregate([
      {
        $group: {
          _id: '$sourceOrganization',
          count: { $sum: 1 },
          latestUpdate: { $max: '$lastUpdated' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get total record count
    const totalRecords = await EconomicIndicator.countDocuments();

    // Get record counts by year
    const yearStats = await EconomicIndicator.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        sourceBreakdown: sourceStats,
        recentYears: yearStats,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Get data source status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving data source status'
    });
  }
};
