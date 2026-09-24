const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { upload } = require("../helpers/multer");

// Blog routes
router.post("/", upload.single("featuredImage"), blogController.createBlog);
router.get("/", blogController.getAllBlogs);
router.get("/:slug", blogController.getBlogById);

router.put("/:id", upload.single("featuredImage"), blogController.updateBlog);
router.patch("/:id/status", blogController.toggleBlogStatus);
router.patch("/:id/featured", blogController.toggleBlogFeatured);
router.patch("/:id/trending", blogController.toggleBlogTrending);
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
