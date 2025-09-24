const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  type: {
    type: String,
    enum: ['Economic', 'Social', 'Crisis', 'System'],
    required: true
  },
  countryCode: {
    type: String,
    uppercase: true
  },
  triggerData: {
    indicatorCode: String,
    threshold: Number,
    actualValue: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date
}, {
  timestamps: true
});

alertSchema.index({ severity: -1, createdAt: -1 });
alertSchema.index({ countryCode: 1, isActive: 1 });

module.exports = mongoose.model('Alert', alertSchema);
