const express = require("express");
const router = express.Router();
const Role = require("../models/Role");

// Create Role
router.post("/create", async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = new Role({ name, permissions });
    await role.save();
    res.status(201).json({ success: true, role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Roles
router.get("/all", async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a role
router.delete("/delete/:id", async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
