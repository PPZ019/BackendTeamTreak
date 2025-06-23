const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
