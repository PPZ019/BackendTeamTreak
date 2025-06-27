const express = require('express');
const router = express.Router();
const Form24Q = require('../models/Form24Q');
const { auth, authRole } = require('../middlewares/auth-middleware');

// Get all Form 24Q records
router.get('/', auth, authRole(['employee', 'hr']), async (req, res) => {
  try {
    const records = await Form24Q.find().sort({ financialYear: -1, quarter: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new Form 24Q entry
router.post('/', auth, authRole(['client']), async (req, res) => {
  try {
    const { quarter, financialYear, auditTrail } = req.body;

    const newEntry = new Form24Q({
      quarter,
      financialYear,
      generated: true,
      auditTrail,
    });

    await newEntry.save();
    res.status(201).json({ success: true, message: 'Form 24Q entry created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating Form 24Q' });
  }
});

// Submit Form 24Q
router.post('/submit/:id', auth, authRole(['client', 'hr']), async (req, res) => {
  try {
    const form24q = await Form24Q.findById(req.params.id);
    if (!form24q) return res.status(404).json({ message: 'Form 24Q not found' });

    form24q.status = 'submitted';
    await form24q.save();

    res.json({ success: true, message: 'Form 24Q submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error submitting Form 24Q' });
  }
});

module.exports = router;
