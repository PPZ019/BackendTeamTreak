const Document = require('../models/Document');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType } = req.body;
    const employeeId = req.employeeId;

    const doc = new Document({
      employeeId,
      documentType,
      filePath: req.file.path
    });

    await doc.save();

    res.status(200).json({
      message: 'Uploaded successfully!',
      documentId: doc._id,
      documentType: doc.documentType,
      filePath: doc.filePath
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed on server' });
  }
};

module.exports = { uploadDocument };


