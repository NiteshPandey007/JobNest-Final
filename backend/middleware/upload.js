// ============================================
// middleware/upload.js - File Upload with Multer
// ============================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// STORAGE CONFIGURATION
// Defines where and how to save uploaded files
// ============================================
const storage = multer.diskStorage({
  // Set the destination folder
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/resumes');

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // Set the filename: userId-timestamp-originalname
  filename: function(req, file, cb) {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// ============================================
// FILE FILTER
// Only allow PDF, DOC, DOCX files for resumes
// ============================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
  }
};

// ============================================
// MULTER CONFIGURATION
// ============================================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Export upload middleware for single resume file
// Usage in routes: router.post('/apply', protect, uploadResume, controller)
const uploadResume = upload.single('resume'); // 'resume' is the form field name

// Error handler for multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = { uploadResume, handleUploadError };
