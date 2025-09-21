const mongoose = require('mongoose');

const crisisEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  crisisType: {
    type: String,
    required: true,
    enum: [
      'Economic Recession',
      'Financial Crisis',
      'Currency Crisis',
      'Debt Crisis',
      'Natural Disaster',
      'Political Instability',
      'Pandemic',
      'Social Unrest',
      'Other'
    ]
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  affectedCountries: [{
    countryCode: {
      type: String,
      required: true,
      ref: 'Country'
    },
    impactLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    }
  }],
  economicImpact: {
    gdpImpact: {
      type: Number,
      min: -100,
      max: 100
    },
    unemploymentImpact: {
      type: Number,
      min: -50,
      max: 50
    },
    inflationImpact: {
      type: Number,
      min: -50,
      max: 100
    }
  },
  sources: [{
    name: String,
    url: String,
    publishDate: Date
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  alertLevel: {
    type: String,
    enum: ['Green', 'Yellow', 'Orange', 'Red'],
    default: 'Green'
  }
}, {
  timestamps: true
});

// Indexes for crisis queries
crisisEventSchema.index({ crisisType: 1, severity: 1 });
crisisEventSchema.index({ startDate: -1 });
crisisEventSchema.index({ 'affectedCountries.countryCode': 1 });

module.exports = mongoose.model('CrisisEvent', crisisEventSchema);
