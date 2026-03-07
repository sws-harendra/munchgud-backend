const express = require("express");
const router = express.Router();
const instagramController = require("../controllers/instagram.controller");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { InstagramPost } = require("../models");


// // Admin only
router.post("/add", async (req, res) => {
  try {
    const { url } = req.body;

    const post = await InstagramPost.create({ url });

    return res.status(200).json({
      success: true,
      post,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error adding post" });
  }
});

// Public
router.get("/all", instagramController.getPosts);


// DELETE post
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await InstagramPost.destroy({
      where: { id }
    });

    res.json({ message: "Instagram post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;