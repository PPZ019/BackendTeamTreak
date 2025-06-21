const express = require("express");
const router = express.Router();
const Company = require("../models/Company");

// Create Company
router.post("/company", async (req, res) => {
    try {
      const company = await Company.create(req.body);
      res.status(201).json({ success: true, result: company });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });
  
  // Get All Companies
  router.get("/company", async (req, res) => {
    try {
      const companies = await Company.find();
      res.status(200).json({ success: true, result: companies });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
  module.exports = router;