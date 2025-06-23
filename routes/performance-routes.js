const express = require("express");
const router = express.Router();
const Performance = require("../models/performance-model");
const { auth } = require("../middlewares/auth-middleware");

// ✅ Add Performance
router.post("/add", auth, async (req, res) => {
  try {
    const { employeeId, rating, feedback } = req.body;
    const reviewer = req.user._id;

    const newPerf = new Performance({
      employeeId,
      reviewer,
      rating,
      feedback,
    });

    await newPerf.save();
    res.status(201).json({ success: true, data: newPerf });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all Performance Records
router.get("/all", auth, async (req, res) => {
    try {
      let query = {};
  
      // If logged in user is an employee, only show their own reviews
      if (req.user.type === "employee") {
        query.employeeId = req.user._id;
      }
  
      const data = await Performance.find(query)
        .populate("employeeId", "name email")
        .populate("reviewer", "name")
        .sort({ reviewDate: -1 });
  
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  router.get("/employee", auth, async (req, res) => {
    try {
      const userId = req.user._id;
      const data = await Performance.find({ employeeId: userId })
        .populate("reviewer", "name")
        .sort({ reviewDate: -1 });
  
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
  

module.exports = router;
