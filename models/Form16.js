
const mongoose = require('mongoose');

const Form16Schema = new mongoose.Schema({
  empId: String,
  name: String,
  financialYear: String,
  fileUrl: String,
});

module.exports = mongoose.model('Form16', Form16Schema);
