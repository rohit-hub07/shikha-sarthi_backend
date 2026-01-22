# Siksha Backend

This is a minimal secure Express backend that demonstrates:

- JWT auth (register/login)
- Uploading files to Cloudinary (memory upload -> Cloudinary)
- Storing media metadata in MongoDB
- Security middlewares (helmet, rate-limit, mongo-sanitize, xss-clean, CORS)

Quick start

1. Copy `.env.example` to `.env` and set values (MongoDB URI, Cloudinary credentials, JWT secret).
2. cd backend && npm install
3. npm run dev

Endpoints

- POST /api/auth/register  — register (name, email, password)
- POST /api/auth/login     — login (email, password) -> returns JWT
- POST /api/media/upload  — multipart/form-data file(s) under field `file` (single or multiple)
- GET  /api/media         — list media saved in MongoDB
- GET  /api/media/cloudinary — list resources from Cloudinary (account-limited)
