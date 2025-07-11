const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["admin", "employee", "all"], required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);