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

  router.get("/company/:id", async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ success: false, message: "Company not found" });
      }
  
      res.status(200).json({ success: true, name: company.name, data: company });
    } catch (err) {
      console.error("Error fetching company", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  module.exports = router;