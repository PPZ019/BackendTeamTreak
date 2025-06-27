const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Form16 = require('../models/Form16');
const User = require("../models/user-model")
const { auth } = require("../middlewares/auth-middleware");

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/form16'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET all Form 16 records
router.get('/', async (req, res) => {
  try {
    const records = await Form16.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new Form 16
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { empId, name, financialYear } = req.body;
    const newRecord = new Form16({
      empId,
      name,
      financialYear,
      fileUrl: `/uploads/form16/${req.file.filename}`,
    });
    await newRecord.save();
    res.status(201).json({ message: 'Form 16 uploaded' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/me', auth, async (req, res) => {
    try {
      const form16s = await Form16.find({ empId: req.user._id });
      res.json({ success: true, data: form16s });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

module.exports = router;