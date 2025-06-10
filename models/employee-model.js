const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: String,
  department: String,
  annualLeaves: Number,
  casualLeaves: Number,
  sickLeaves: Number,
  attendanceSummary: String,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
