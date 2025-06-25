// /configs/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // ✅ set in .env
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 2. Storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'user-profiles',
    resource_type: 'image',
    public_id: Date.now() + '-' + file.originalname.split('.')[0]
  }),
});

// 3. File filter
const fileFilter = (req, file, cb) => {
  console.log("📂 File Filter Called:", file.originalname, file.fieldname, file.mimetype);

  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  // 🧠 Yeh condition badalni hai:
  if (file.fieldname === 'profile' && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // ✅ valid file
  } else {
    cb(new Error('Unsupported file type'), false); // ❌ invalid file
  }
};


// 4. Export multer upload
const upload = multer({ storage, fileFilter });
module.exports = upload;
