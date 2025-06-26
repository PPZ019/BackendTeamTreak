const ExpenseClaim = require('../models/ExpenseClaim');
const User = require('../models/user-model');
const path = require('path');

// ✅ Submit Claim
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

// ✅ Get My Claims
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await ExpenseClaim.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching claims' });
  }
};

// ✅ Get All Claims (for admin use only)
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await ExpenseClaim.find()
      .populate('employeeId', 'name email company')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch claims' });
  }
};

exports.getCompanyClaims = async (req, res) => {
  try {
    const leaderCompanyId = req.user.company; // ✅ Company from authenticated client

    // First, find employeeIds who belong to the same company
    const employeeIds = await User.find({ company: leaderCompanyId }).select('_id');

    // Extract _ids as array
    const employeeIdList = employeeIds.map(e => e._id);

    // Get only claims from those employees
    const claims = await ExpenseClaim.find({ employeeId: { $in: employeeIdList } })
      .populate('employeeId', 'name email company')
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error("🔥 getCompanyClaims error:", error.message);
    res.status(500).json({ message: 'Failed to fetch company claims' });
  }
};

