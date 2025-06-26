const mongoose = require('mongoose');

const expenseClaimSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ reference to User collection
    required: true,
  },
  category: String,
  amount: Number,
  date: String,
  description: String,
  receipt_url: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  admin_comment: String,
}, { timestamps: true });

module.exports = mongoose.model('ExpenseClaim', expenseClaimSchema);
