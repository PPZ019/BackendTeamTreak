const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
const multer = require("multer"); 

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
timeout: 60000 

});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_profiles', 
    allowed_formats: ['jpg', 'jpeg', 'png'],
        timeout: 60000, 

  },
});

const upload = multer({ storage }); 

module.exports = upload; 