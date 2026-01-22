const express = require('express');
const router = express.Router();
const ePaperController = require('../controllers/ePaperController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, //50mb limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get all E-Papers
router.get('/', ePaperController.getAllEPapers);

// Get E-Paper by year and month
router.get('/:year/:month', ePaperController.getEPaperByYearMonth);

// Upload PDF to Cloudinary and create E-Paper record
router.post('/upload', upload.single('pdf'), ePaperController.uploadEPaper);

// Replace existing E-Paper
router.put('/replace/:year/:month', upload.single('pdf'), ePaperController.replaceEPaper);

// Delete E-Paper
router.delete('/:year/:month', ePaperController.deleteEPaper);

module.exports = router;
