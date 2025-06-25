
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload=require('../configs/cloudinaryConfig')

const User = require('../models/user-model'); 
require('dotenv').config();


router.post('/user', upload.single('profile'), async (req, res) => {
    try {
        let {
            name = '',
            email = '',
            username = '',
            mobile = '',
            password = '',
            type = 'Employee',
            address = '',
            adminPassword = '',
        } = req.body;

        name = name.trim();
        email = email.trim().toLowerCase();
        username = username.trim().toLowerCase();
        mobile = mobile.trim();
        address = address.trim();

        type = type.trim();
        type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(); // "employee" → "Employee"

        if (!name || !email || !username || !mobile || !password || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const allowedTypes = ['Admin', 'Employee', 'Leader', 'Client'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid user type' });
        }
        console.log('📦 Cleaned user type:', type);

        if (type === 'Admin' && adminPassword !== process.env.ADMIN_SECRET) {
            return res.status(401).json({ success: false, message: 'Invalid admin password' });
        }

        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Email or username already exists' });
        }

        const imageUrl = req.file ? req.file.path : null;

        const user = new User({
            name,
            email,
            username,
            mobile,
            password,  
            type,
            address,
            image: imageUrl,
        });

        await user.save();

        return res.status(201).json({
            success: true,
            message: 'User added successfully',
            data: { id: user._id },
        });

    } catch (err) {
        console.error('🔥 add-user error:', err); 
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
            stack: err.stack, 
        });
    }
});


module.exports = router;
