const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');

module.exports = function securityMiddleware(app) {
  // Helmet for headers
  app.use(helmet());

  // Rate limiter
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  app.use(limiter);

  // Body size limits and parsers handled in index.js
  app.use(cookieParser());

  // Data sanitization against NoSQL injection
  app.use(mongoSanitize());

  // Prevent XSS
  app.use(xss());

  // CORS - adjust origin as needed
  const allowedOrigins = [
  "http://localhost:5173",
  "https://react-shiksak-sarthi.vercel.app",
  "https://react-shiksak-sarthi-vpxo.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {

      // 1. Allow requests from serverless (no origin)
      if (!origin) return callback(null, true);

      // 2. Allow requests from frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 3. Block everything else
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
}
