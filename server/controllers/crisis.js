const CrisisEvent = require('../models/CrisisEvent');
const Country = require('../models/Country');

// @desc    Get all crisis events with filtering
// @route   GET /api/crisis
// @access  Private
// exports.getCrisisEvents = async (req, res) => {
//   try {
//     let query = {};
    
//     // Build query based on parameters
//     if (req.query.type) {
//       query.crisisType = req.query.type;
//     }
    
//     if (req.query.severity) {
//       query.severity = req.query.severity;
//     }
    
//     if (req.query.country) {
//       query['affectedCountries.countryCode'] = req.query.country.toUpperCase();
//     }
    
//     if (req.query.active === 'true') {
//       query.isActive = true;
//       query.endDate = { $exists: false };
//     }

//     // Date range filtering
//     if (req.query.startDate || req.query.endDate) {
//       query.startDate = {};
//       if (req.query.startDate) {
//         query.startDate.$gte = new Date(req.query.startDate);
//       }
//       if (req.query.endDate) {
//         query.startDate.$lte = new Date(req.query.endDate);
//       }
//     }

//     // Execute query with pagination
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const startIndex = (page - 1) * limit;

//     const crises = await CrisisEvent.find(query)
//       .sort({ startDate: -1 })
//       .limit(limit)
//       .skip(startIndex)
//       .populate('affectedCountries.countryCode', 'name region');

//     const total = await CrisisEvent.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: crises.length,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       },
//       data: crises
//     });
//   } catch (error) {
//     console.error('Get crisis events error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving crisis events'
//     });
//   }
// };

// @desc    Get crisis by ID
// @route   GET /api/crisis/:id
// @access  Private
exports.getCrisisById = async (req, res) => {
  try {
    const crisis = await CrisisEvent.findById(req.params.id)
      .populate('affectedCountries.countryCode', 'name region incomeLevel');

    if (!crisis) {
      return res.status(404).json({
        success: false,
        message: 'Crisis event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: crisis
    });
  } catch (error) {
    console.error('Get crisis by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving crisis event'
    });
  }
};

// @desc    Create new crisis event
// @route   POST /api/crisis
// @access  Private (Admin/Analyst)
exports.createCrisisEvent = async (req, res) => {
  try {
    // Validate affected countries exist
    if (req.body.affectedCountries && req.body.affectedCountries.length > 0) {
      const countryCodes = req.body.affectedCountries.map(ac => ac.countryCode);
      const existingCountries = await Country.find({
        countryCode: { $in: countryCodes }
      });
      
      if (existingCountries.length !== countryCodes.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more country codes are invalid'
        });
      }
    }

    const crisis = await CrisisEvent.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Crisis event created successfully',
      data: crisis
    });
  } catch (error) {
    console.error('Create crisis error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating crisis event'
    });
  }
};

// @desc    Update crisis event
// @route   PUT /api/crisis/:id
// @access  Private (Admin/Analyst)
exports.updateCrisisEvent = async (req, res) => {
  try {
    const crisis = await CrisisEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('affectedCountries.countryCode', 'name region');

    if (!crisis) {
      return res.status(404).json({
        success: false,
        message: 'Crisis event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crisis event updated successfully',
      data: crisis
    });
  } catch (error) {
    console.error('Update crisis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating crisis event'
    });
  }
};

// @desc    Delete crisis event
// @route   DELETE /api/crisis/:id
// @access  Private (Admin)
exports.deleteCrisisEvent = async (req, res) => {
  try {
    const crisis = await CrisisEvent.findByIdAndDelete(req.params.id);

    if (!crisis) {
      return res.status(404).json({
        success: false,
        message: 'Crisis event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crisis event deleted successfully'
    });
  } catch (error) {
    console.error('Delete crisis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting crisis event'
    });
  }
};

// @desc    Get crisis events by country
// @route   GET /api/crisis/country/:countryCode
// @access  Private
exports.getCrisisByCountry = async (req, res) => {
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

    const crises = await CrisisEvent.find({
      'affectedCountries.countryCode': countryCode,
      isActive: true
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        country: country,
        crises: crises,
        totalCount: crises.length
      }
    });
  } catch (error) {
    console.error('Get crisis by country error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving country crises'
    });
  }
};

// @desc    Get active crisis events
// @route   GET /api/crisis/active
// @access  Private
// exports.getActiveCrises = async (req, res) => {
//   try {
//     console.log('getActiveCrises called');
//     const activeCrises = await CrisisEvent.find({
//       isActive: true,
//       $or: [
//         { endDate: { $exists: false } },
//         { endDate: null },
//         { endDate: { $gte: new Date() } }
//       ]
//     })
//     .sort({ severity: -1, startDate: -1 })
//     .populate('affectedCountries.countryCode', 'name region');

//     console.log(`Found ${activeCrises.length} active crises`);
//     res.status(200).json({
//       success: true,
//       count: activeCrises.length,
//       data: activeCrises
//     });
//   } catch (error) {
//     console.error('Get active crises error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving active crises'
//     });
//   }
// };

exports.getActiveCrises = async (req, res) => {
  try {
    console.log('Getting active crises...');
    
    const activeCrises = await CrisisEvent.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    }).sort({ severity: -1, startDate: -1 });

    console.log(`Found ${activeCrises.length} active crises`);
    
    res.status(200).json({
      success: true,
      count: activeCrises.length,
      data: activeCrises
    });
  } catch (error) {
    console.error('Get active crises error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving active crises'
    });
  }
};

exports.getCrisisEvents = async (req, res) => {
  try {
    console.log('Getting crisis events with query:', req.query);
    
    let query = {};
    
    // Build query based on parameters
    if (req.query.type) {
      query.crisisType = req.query.type;
    }
    
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    
    if (req.query.country) {
      query['affectedCountries.countryCode'] = req.query.country.toUpperCase();
    }
    
    if (req.query.active === 'true') {
      query.isActive = true;
      query.endDate = { $exists: false };
    }

    // Execute query with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const crises = await CrisisEvent.find(query)
      .sort({ startDate: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await CrisisEvent.countDocuments(query);

    console.log(`Found ${crises.length} crisis events`);

    res.status(200).json({
      success: true,
      count: crises.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: crises
    });
  } catch (error) {
    console.error('Get crisis events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving crisis events'
    });
  }
};

// @desc    Get crisis timeline
// @route   GET /api/crisis/timeline
// @access  Private
exports.getCrisisTimeline = async (req, res) => {
  try {
    const startYear = parseInt(req.query.startYear) || new Date().getFullYear() - 5;
    const endYear = parseInt(req.query.endYear) || new Date().getFullYear();

    const timeline = await CrisisEvent.aggregate([
      {
        $match: {
          startDate: {
            $gte: new Date(`${startYear}-01-01`),
            $lte: new Date(`${endYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          events: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get crisis timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving crisis timeline'
    });
  }
};
