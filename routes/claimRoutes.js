const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  submitClaim,
  getMyClaims,
  getAllClaims,
  getCompanyClaims
} = require('../controllers/claimController');

const { auth, authRole } = require('../middlewares/auth-middleware');

// 🧾 Storage config for receipts (stored in /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });

router.post('/claim', auth, upload.single('receipt'), submitClaim);

// 📄 My claims (Employee)
router.get('/my-claims', auth, getMyClaims);

// 🔍 All claims (Admin)
router.get('/admin/all-claims', auth, authRole(['admin', 'client']), getAllClaims);

// 🧑‍💼 Company claims (Leader)
router.get('/leader/claims', auth, authRole(['client']), getCompanyClaims);

module.exports = router;
