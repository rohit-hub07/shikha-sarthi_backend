const EPaper = require('../models/EPaper');
const { cloudinary } = require('../config/cloudinary');

// Get all E-Papers
exports.getAllEPapers = async (req, res) => {
  try {
    const ePapers = await EPaper.find().sort({ year: -1, month: 1 });
    res.json({ success: true, data: ePapers });
  } catch (error) {
    console.error('Error fetching E-Papers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch E-Papers' });
  }
};

// Get E-Paper by year and month
exports.getEPaperByYearMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const ePaper = await EPaper.findOne({ year: parseInt(year), month });

    if (!ePaper) {
      return res.status(404).json({ success: false, message: 'E-Paper not found' });
    }

    res.json({ success: true, data: ePaper });
  } catch (error) {
    console.error('Error fetching E-Paper:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch E-Paper' });
  }
};

// Upload new E-Paper with file handling
exports.uploadEPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' });
    }

    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    console.log('Uploading E-Paper:', { year, month, fileSize: req.file.size });

    // Upload to Cloudinary
    cloudinary.uploader.upload_stream(
      {
        folder: 'epapers',
        resource_type: 'raw',
        public_id: `epaper_${year}_${month}_${Date.now()}`
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, message: 'Failed to upload PDF to Cloudinary' });
        }

        // Create E-Paper record in database
        try {
          // Check if E-Paper already exists
          const existingEPaper = await EPaper.findOne({ year: parseInt(year), month });

          if (existingEPaper) {
            // Delete the just-uploaded file from Cloudinary since it already exists
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
            return res.status(409).json({
              success: false,
              message: 'E-Paper already exists for this year and month. Use replace endpoint to update.'
            });
          }

          const newEPaper = new EPaper({
            year: parseInt(year),
            month,
            pdfUrl: result.secure_url,
            cloudinaryPublicId: result.public_id
          });

          await newEPaper.save();
          console.log('E-Paper saved successfully:', newEPaper);
          res.status(201).json({ success: true, data: newEPaper });
        } catch (dbError) {
          // If database save fails, delete from Cloudinary
          await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
          console.error('Database error:', dbError);
          return res.status(500).json({ success: false, message: 'Failed to save E-Paper to database' });
        }
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload E-Paper' });
  }
};

// Replace existing E-Paper with file handling
exports.replaceEPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' });
    }

    const { year, month } = req.params;

    console.log('Replacing E-Paper:', { year, month, fileSize: req.file.size });

    // Upload to Cloudinary
    cloudinary.uploader.upload_stream(
      {
        folder: 'epapers',
        resource_type: 'raw',
        format: 'pdf',
        public_id: `epaper_${year}_${month}_${Date.now()}`
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, message: 'Failed to upload PDF to Cloudinary' });
        }

        // Replace E-Paper record in database
        try {
          // Find existing E-Paper
          const existingEPaper = await EPaper.findOne({ year: parseInt(year), month });

          if (!existingEPaper) {
            // Delete the just-uploaded file from Cloudinary since there's nothing to replace
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
            return res.status(404).json({ success: false, message: 'E-Paper not found' });
          }

          // Delete old PDF from Cloudinary
          try {
            await cloudinary.uploader.destroy(existingEPaper.cloudinaryPublicId, {
              resource_type: 'raw'
            });
          } catch (cloudinaryError) {
            console.error('Error deleting old PDF from Cloudinary:', cloudinaryError);
          }

          // Update with new PDF
          existingEPaper.pdfUrl = result.secure_url;
          existingEPaper.cloudinaryPublicId = result.public_id;
          await existingEPaper.save();

          console.log('E-Paper replaced successfully:', existingEPaper);
          res.json({ success: true, data: existingEPaper });
        } catch (dbError) {
          // If database update fails, delete from Cloudinary
          await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
          console.error('Database error:', dbError);
          return res.status(500).json({ success: false, message: 'Failed to replace E-Paper in database' });
        }
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error('Replace error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to replace E-Paper' });
  }
};

// Delete E-Paper
exports.deleteEPaper = async (req, res) => {
  try {
    const { year, month } = req.params;

    const ePaper = await EPaper.findOne({ year: parseInt(year), month });

    if (!ePaper) {
      return res.status(404).json({ success: false, message: 'E-Paper not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(ePaper.cloudinaryPublicId, {
        resource_type: 'raw'
      });
    } catch (cloudinaryError) {
      console.error('Error deleting PDF from Cloudinary:', cloudinaryError);
      // Continue even if deletion fails
    }

    await EPaper.deleteOne({ year: parseInt(year), month });
    res.json({ success: true, message: 'E-Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting E-Paper:', error);
    res.status(500).json({ success: false, message: 'Failed to delete E-Paper' });
  }
};
