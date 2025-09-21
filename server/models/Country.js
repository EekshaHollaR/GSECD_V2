const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  countryCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 3
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    enum: [
      'Sub-Saharan Africa',
      'Europe & Central Asia',
      'Middle East & North Africa',
      'East Asia & Pacific',
      'South Asia',
      'Latin America & Caribbean',
      'North America'
    ]
  },
  incomeLevel: {
    type: String,
    enum: ['Low income', 'Lower middle income', 'Upper middle income', 'High income']
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  population: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
countrySchema.index({ region: 1 });
countrySchema.index({ incomeLevel: 1 });
countrySchema.index({ countryCode: 1 });

module.exports = mongoose.model('Country', countrySchema);
