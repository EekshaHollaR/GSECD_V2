const mongoose = require('mongoose');

const socialIndicatorSchema = new mongoose.Schema({
  indicatorCode: {
    type: String,
    required: true,
    uppercase: true
  },
  indicatorName: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true,
    uppercase: true
  },
  year: {
    type: Number,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  category: {
    type: String,
    enum: ['Healthcare', 'Education', 'Poverty', 'Gender', 'Environment'],
    required: true
  },
  sourceOrganization: {
    type: String,
    enum: ['UN', 'WHO', 'UNESCO', 'World Bank', 'UNDP'],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      if (ret.value && ret.value.toString) {
        ret.value = parseFloat(ret.value.toString());
      }
      return ret;
    }
  }
});

socialIndicatorSchema.index({ countryCode: 1, indicatorCode: 1, year: -1 });
socialIndicatorSchema.index({ category: 1, year: -1 });

module.exports = mongoose.model('SocialIndicator', socialIndicatorSchema);
