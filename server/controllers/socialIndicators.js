const SocialIndicator = require('../models/SocialIndicator');

exports.getSocialIndicators = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.country) {
      query.countryCode = req.query.country.toUpperCase();
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.year) {
      query.year = parseInt(req.query.year);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const indicators = await SocialIndicator.find(query)
      .sort({ year: -1, countryCode: 1 })
      .limit(limit)
      .skip(skip);

    const total = await SocialIndicator.countDocuments(query);

    res.status(200).json({
      success: true,
      count: indicators.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: indicators
    });
  } catch (error) {
    console.error('Get social indicators error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving social indicators'
    });
  }
};

exports.createSocialIndicator = async (req, res) => {
  try {
    const indicator = await SocialIndicator.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Social indicator created successfully',
      data: indicator
    });
  } catch (error) {
    console.error('Create social indicator error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating social indicator',
      error: error.message
    });
  }
};
