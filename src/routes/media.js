const express = require('express');
const multer = require('multer');
const { upload } = require('../controllers/mediaController');

const router = express.Router();

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', uploadMiddleware.single('file'), upload);


module.exports = router;
