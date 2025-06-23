const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer');
const { uploadDocument } = require('../controllers/documentController');

router.post('/upload', auth, upload.single('document'), uploadDocument);

module.exports = router;

