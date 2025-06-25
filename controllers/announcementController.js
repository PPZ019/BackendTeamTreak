const Announcement = require("../models/announcement-model");

// ➕ Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    const { company } = req.user;

    if (!title || !message || !audience) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!company) {
      return res.status(403).json({ success: false, message: "Company not assigned." });
    }

    const newAnnouncement = await Announcement.create({
      title,
      message,
      audience,
      company,
    });

    return res.status(201).json({ success: true, data: newAnnouncement });
  } catch (err) {
    console.error("Create Announcement Error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


// 📥 Get All Announcements
// 📥 Get All Announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.company) {
      return res.status(403).json({ success: false, message: "Unauthorized or company not assigned." });
    }

    const filter = {
      company: user.company,
    };

    // 👇 Audience filter (optional - e.g., only show "all" or "employee" for employee users)
    if (user.type === "employee") {
      filter.audience = { $in: ["all", "employee"] };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    console.error("Get Announcements Error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
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