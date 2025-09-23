const mongoose = require('mongoose');

const economicIndicatorSchema = new mongoose.Schema({
  indicatorCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  indicatorName: {
    type: String,
    required: true,
    trim: true
  },
  countryCode: {
    type: String,  
    required: true,
    uppercase: true
  },
  year: {
    type: Number,
    required: true,
    min: 1960,
    max: new Date().getFullYear() + 1
  },
  value: {
    type: mongoose.Schema.Types.Decimal128,
    required: function() {
      return this.value !== null;
    }
  },
  unit: {
    type: String,
    trim: true
  },
  sourceOrganization: {
    type: String,
    enum: ['World Bank', 'IMF', 'OECD', 'FRED', 'Trading Economics', 'Other'],
    required: true
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'GDP',
      'Employment',
      'Inflation',
      'Trade',
      'Government',
      'Social',
      'Financial',
      'Environmental'
    ],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isProjected: {
    type: Boolean,
    default: false
  },
  confidence: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      // Convert Decimal128 to number
      if (ret.value != null && ret.value.toString) {
        ret.value = parseFloat(ret.value.toString());
      }
      return ret;
    }
  }
});

// Compound indexes for efficient querying
economicIndicatorSchema.index({ countryCode: 1, indicatorCode: 1, year: -1 });
economicIndicatorSchema.index({ category: 1, year: -1 });
economicIndicatorSchema.index({ sourceOrganization: 1 });

module.exports = mongoose.model('EconomicIndicator', economicIndicatorSchema);
