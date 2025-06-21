const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["National", "Festival", "Optional"],
    required: true,
  },
});

module.exports = mongoose.model("Holiday", holidaySchema);
