const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    basic: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowance: {
      type: Number,
      default: 0,
    },
    deduction: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // includes createdAt
);

module.exports = mongoose.model("Salary", salarySchema);
