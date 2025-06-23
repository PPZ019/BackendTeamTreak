const express = require('express');
const router = express.Router();

const {auth} = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer');
const { uploadDocument } = require('../controllers/documentController');
const Document = require('../models/Document');


router.post('/upload',auth, upload.single('document'), uploadDocument);
router.get('/my', auth, async (req, res) => {
    try {
      const documents = await Document.find({ employeeId: req.user._id }).sort({ uploadedAt: -1 });
      res.status(200).json({ success: true, documents });
    } catch (error) {
      console.error("Error fetching documents", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

module.exports = router;

