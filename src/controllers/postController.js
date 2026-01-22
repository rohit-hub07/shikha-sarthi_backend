const Post = require("../models/Post");

exports.getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.log("error inside of getPosts controller: ", error.message);
    return res.status(500).json({
      message: error?.message || "Internal server error",
      success: false,
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;
    if (!title || !description || !imageUrl || !category) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      })
    }
    const newPost = await Post.create({
      title, description, imageUrl, category
    });
    if (!newPost) {
      return res.status(500).json({
        message: "Something went wrong! Please try again!",
        success: false,
      })
    }
    return res.status(200).json({
      message: "Post updated successfully",
      success: true,
      post: newPost
    })
  } catch (error) {
    console.log("error inside of updatePost controller: ", error.message);
    return res.status(500).json({
      message: error?.response?.data?.message || "Internal server error",
      success: false,
    })
  }
}