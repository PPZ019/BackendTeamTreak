const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const employeeId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Check if document of same type already exists
    const existingDoc = await Document.findOne({ employeeId, documentType });

    if (existingDoc) {
      // Delete old file if it exists
      const oldPath = path.resolve(existingDoc.filePath);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error('Failed to delete old file:', err);
        });
      }

      // Update document with new file
      existingDoc.filePath = filePath;
      existingDoc.uploadedAt = new Date();
      await existingDoc.save();
      return res.status(200).json({ success: true, message: 'Document updated.' });
    }

    // Create new document
    const newDoc = new Document({
      employeeId,
      documentType,
      filePath,
    });
    await newDoc.save();

    return res.status(201).json({ success: true, message: 'Document uploaded.' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { uploadDocument };
