const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');

// Get all posts
router.get('/', getPosts);

// Update post route
router.post('/create', createPost);

module.exports = router;
