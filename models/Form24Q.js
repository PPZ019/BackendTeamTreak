const mongoose = require('mongoose');

const form24QSchema = new mongoose.Schema({
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    required: true,
  },
  financialYear: {
    type: String,
    required: true,
  },
  generated: {
    type: Boolean,
    default: false,
  },
  auditTrail: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'submitted'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Form24Q', form24QSchema);
