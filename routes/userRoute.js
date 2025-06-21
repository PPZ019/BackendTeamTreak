
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload=require('../configs/cloudinaryConfig')

const User = require('../models/user-model'); // path सही रखना
require('dotenv').config();

/* ─────────────────────────────
 *  POST /api/admin/user
 *  expects multipart/form‑data  field = profile (image)
 * ────────────────────────────*/
router.post('/user', upload.single('profile'), async (req, res) => {
    try {
        /* ─── 1. Destructure body fields ─── */
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

        /* ─── 2. Trim all string inputs ─── */
        name = name.trim();
        email = email.trim().toLowerCase();
        username = username.trim().toLowerCase();
        mobile = mobile.trim();
        address = address.trim();

        /* ─── 3. Clean & normalise user‑type ─── */
        type = type.trim();
        type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(); // "employee" → "Employee"

        /* ─── 4. Basic field validation ─── */
        if (!name || !email || !username || !mobile || !password || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        /* ─── 5. Allowed user‑types ─── */
        const allowedTypes = ['Admin', 'Employee', 'Leader', 'Client'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid user type' });
        }
        console.log('📦 Cleaned user type:', type);

        /* ─── 6. Admin password verification ─── */
        if (type === 'Admin' && adminPassword !== process.env.ADMIN_SECRET) {
            return res.status(401).json({ success: false, message: 'Invalid admin password' });
        }

        /* ─── 7. Duplicate email/username check ─── */
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Email or username already exists' });
        }

        /* ─── 8. Cloudinary image URL (nullable) ─── */
        const imageUrl = req.file ? req.file.path : null;

        /* ─── 9. Create & save user ─── */
        const user = new User({
            name,
            email,
            username,
            mobile,
            password,  // hashed in pre('save')
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
        console.error('🔥 add-user error:', err); // Yeh already hai
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
            stack: err.stack, // 👈 Add this
        });
    }
});


module.exports = router;
