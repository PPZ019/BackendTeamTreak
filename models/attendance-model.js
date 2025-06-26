const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  date: Number,
  month: Number,
  year: Number,
  day: String,
  present: Boolean,
  ip: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
