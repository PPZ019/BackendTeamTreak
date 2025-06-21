const Announcement = require("../models/announcement-model");

// ➕ Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    if (!title || !message || !audience) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const newAnnouncement = await Announcement.create({ title, message, audience });
    res.status(201).json({ success: true, data: newAnnouncement });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📥 Get All Announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const audience = req.query.audience; // optional filter
    const query = audience ? { audience } : {};
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🗑️ Delete
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};