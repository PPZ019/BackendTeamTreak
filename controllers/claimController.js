const ExpenseClaim = require('../models/ExpenseClaim');
const path = require('path');

exports.submitClaim = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    const receipt = req.file ? `/uploads/${req.file.filename}` : null;

    const claim = new ExpenseClaim({
      employeeId: req.user._id,
      category,
      amount,
      date,
      description,
      receipt_url: receipt,
    });

    await claim.save();
    res.status(201).json({ message: 'Claim submitted', claim });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit claim' });
  }
};

exports.getMyClaims = async (req, res) => {
  try {
    const claims = await ExpenseClaim.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching claims' });
  }
};
