const EconomicIndicator = require('../models/EconomicIndicator');
const Country = require('../models/Country');

// @desc    Get all economic indicators with filtering
// @route   GET /api/indicators
// @access  Private
exports.getEconomicIndicators = async (req, res) => {
  try {
    let query = {};
    
    // Build query based on parameters
    if (req.query.country) {
      query.countryCode = req.query.country.toUpperCase();
    }
    
    if (req.query.indicator) {
      query.indicatorCode = req.query.indicator.toUpperCase();
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.year) {
      if (req.query.year.includes('-')) {
        const [startYear, endYear] = req.query.year.split('-');
        query.year = { $gte: parseInt(startYear), $lte: parseInt(endYear) };
      } else {
        query.year = parseInt(req.query.year);
      }
    }
    
    if (req.query.source) {
      query.sourceOrganization = req.query.source;
    }

    // Execute query with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const indicators = await EconomicIndicator.find(query)
      .sort({ year: -1, countryCode: 1 })
      .limit(limit)
      .skip(startIndex)
      .populate('countryCode', 'name region');

    const total = await EconomicIndicator.countDocuments(query);

    res.status(200).json({
      success: true,
      count: indicators.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: indicators
    });
  } catch (error) {
    console.error('Get indicators error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving indicators'
    });
  }
};

// @desc    Get indicators by country
// @route   GET /api/indicators/country/:countryCode
// @access  Private
exports.getIndicatorsByCountry = async (req, res) => {
  try {
    const countryCode = req.params.countryCode.toUpperCase();
    
    // Verify country exists
    const country = await Country.findOne({ countryCode });
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    const indicators = await EconomicIndicator.find({ countryCode })
      .sort({ year: -1, category: 1 })
      .limit(100); // Limit to prevent large responses

    // Group by category for better frontend consumption
    const groupedIndicators = indicators.reduce((acc, indicator) => {
      if (!acc[indicator.category]) {
        acc[indicator.category] = [];
      }
      acc[indicator.category].push(indicator);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        country: country,
        indicators: groupedIndicators,
        totalCount: indicators.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving country indicators'
    });
  }
};

// @desc    Create new economic indicator
// @route   POST /api/indicators
// @access  Private (Admin/Analyst)
exports.createIndicator = async (req, res) => {
  try {
    const indicator = await EconomicIndicator.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Economic indicator created successfully',
      data: indicator
    });
  } catch (error) {
    console.error('Create indicator error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating indicator',
      error: error.message
    });
  }
};

// @desc    Get indicator trends over time
// @route   GET /api/indicators/trends/:indicatorCode
// @access  Private
exports.getIndicatorTrends = async (req, res) => {
  try {
    const indicatorCode = req.params.indicatorCode.toUpperCase();
    const countries = req.query.countries ? req.query.countries.split(',') : [];
    const startYear = parseInt(req.query.startYear) || 2010;
    const endYear = parseInt(req.query.endYear) || new Date().getFullYear();

    let query = {
      indicatorCode,
      year: { $gte: startYear, $lte: endYear }
    };

    if (countries.length > 0) {
      query.countryCode = { $in: countries.map(c => c.toUpperCase()) };
    }

    const trends = await EconomicIndicator.find(query)
      .sort({ countryCode: 1, year: 1 })
      .populate('countryCode', 'name region');

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving trends'
    });
  }
};

// @desc    Compare countries on specific indicators
// @route   POST /api/indicators/compare
// @access  Private
exports.compareCountries = async (req, res) => {
  try {
    const { countries, indicators, year } = req.body;

    if (!countries || !indicators || countries.length === 0 || indicators.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Countries and indicators are required'
      });
    }

    const query = {
      countryCode: { $in: countries.map(c => c.toUpperCase()) },
      indicatorCode: { $in: indicators.map(i => i.toUpperCase()) }
    };

    if (year) {
      query.year = year;
    }

    const comparison = await EconomicIndicator.find(query)
      .populate('countryCode', 'name region')
      .sort({ countryCode: 1, indicatorCode: 1, year: -1 });

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during comparison'
    });
  }
};
exports.getIndicatorsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    // Validate category
    const validCategories = ['GDP', 'Employment', 'Inflation', 'Trade', 'Government', 'Social', 'Financial', 'Environmental'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const indicators = await EconomicIndicator.find({ category })
      .sort({ year: -1, countryCode: 1 })
      .limit(limit)
      .skip(startIndex)
      .populate('countryCode', 'name region');

    const total = await EconomicIndicator.countDocuments({ category });

    res.status(200).json({
      success: true,
      count: indicators.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: indicators
    });
  } catch (error) {
    console.error('Get indicators by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving category indicators'
    });
  }
};

// @desc    Update economic indicator
// @route   PUT /api/indicators/:id
// @access  Private (Admin/Analyst)
exports.updateIndicator = async (req, res) => {
  try {
    const indicator = await EconomicIndicator.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('countryCode', 'name region');

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Economic indicator not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Economic indicator updated successfully',
      data: indicator
    });
  } catch (error) {
    console.error('Update indicator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating indicator'
    });
  }
};

// @desc    Delete economic indicator
// @route   DELETE /api/indicators/:id
// @access  Private (Admin)
exports.deleteIndicator = async (req, res) => {
  try {
    const indicator = await EconomicIndicator.findByIdAndDelete(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Economic indicator not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Economic indicator deleted successfully'
    });
  } catch (error) {
    console.error('Delete indicator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting indicator'
    });
  }
};
