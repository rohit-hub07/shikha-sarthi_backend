require('dotenv').config();
const express = require('express');
const path = require('path');

const { connectDB } = require('./config/db');
const { cloudinaryConfig } = require('./config/cloudinary');
const securityMiddleware = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const postRoutes = require('./routes/posts');
const ePaperRoutes = require('./routes/ePaper');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



// Connect to DB
connectDB();

// Cloudinary config
cloudinaryConfig();

// Security & parsers
securityMiddleware(app);

// JSON parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/epapers', ePaperRoutes);

// Health
app.get('/health', (req, res) => res.status(200).json({ message: "Connection successful!", success: true }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
