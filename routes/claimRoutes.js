const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth-middleware');
const { submitClaim, getMyClaims } = require('../controllers/claimController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

router.post('/claim', auth, upload.single('receipt'), submitClaim);
router.get('/claim', auth, getMyClaims);


module.exports = router;
