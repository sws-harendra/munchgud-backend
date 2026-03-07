const { InstagramPost } = require("../models");
const axios = require("axios");

// ================= ADMIN ADD POST =================
exports.addPost = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "Post URL required" });
    }

    console.log("Received URL:", url); // 👈 add this
    const post = await InstagramPost.create({ url });

     console.log("Saved Post:", post); // 👈 add this

    res.json({
      success: true,
      message: "Instagram post added",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL POSTS =================
exports.getPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};