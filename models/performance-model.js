const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or "Employee" depending on your user model
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // the reviewer is also a user
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    default: "",
  },
  reviewDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Performance", performanceSchema);
