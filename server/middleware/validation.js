const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Invalid role')
];

// User login validation
exports.validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Economic indicator validation
exports.validateIndicator = [
  body('indicatorCode')
    .trim()
    .notEmpty()
    .withMessage('Indicator code is required'),
  body('indicatorName')
    .trim()
    .notEmpty()
    .withMessage('Indicator name is required'),
  body('countryCode')
    .trim()
    .isLength({ min: 2, max: 3 })
    .withMessage('Country code must be 2-3 characters'),
  body('year')
    .isInt({ min: 1960, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Value must be numeric'),
  body('category')
    .isIn(['GDP', 'Employment', 'Inflation', 'Trade', 'Government', 'Social', 'Financial', 'Environmental'])
    .withMessage('Invalid category')
];

// Crisis event validation
exports.validateCrisisEvent = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('crisisType')
    .isIn([
      'Economic Recession',
      'Financial Crisis',
      'Currency Crisis',
      'Debt Crisis',
      'Natural Disaster',
      'Political Instability',
      'Pandemic',
      'Social Unrest',
      'Other'
    ])
    .withMessage('Invalid crisis type'),
  body('severity')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid severity level'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format')
];
