const mongoose = require("mongoose");

const ePaperSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
}, { timestamps: true });


ePaperSchema.index({ year: 1, month: 1 }, { unique: true });

const EPaper = mongoose.model("EPaper", ePaperSchema);

module.exports = EPaper;
