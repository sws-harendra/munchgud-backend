"use strict";

const express = require("express");
const router = express.Router();
const trendingImageController = require("../controllers/trendingImage.controller");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { upload } = require("../helpers/multer");

// =============================================================================
// PUBLIC ROUTES
// =============================================================================
// GET /trending-images - Fetch active trending items for storefront
router.get("/", trendingImageController.getTrendingImages);

// =============================================================================
// ADMIN PROTECTED ROUTES
// =============================================================================
// GET /trending-images/admin/all - Get all trending items with statistics
router.get(
  "/admin/all",
  isAuthenticated,
  isAdmin("admin"),
  trendingImageController.getAllTrendingImagesAdmin
);

// PUT /trending-images/reorder/bulk - Reorder trending items
router.put(
  "/reorder/bulk",
  isAuthenticated,
  isAdmin("admin"),
  trendingImageController.reorderTrendingImages
);

// GET /trending-images/:id - Get single trending item
router.get(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  trendingImageController.getTrendingImageById
);

// POST /trending-images - Upload and create new trending item
router.post(
  "/",
  isAuthenticated,
  isAdmin("admin"),
  upload.single("image"),
  trendingImageController.createTrendingImage
);

// PUT /trending-images/:id - Update trending item
router.put(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  upload.single("image"),
  trendingImageController.updateTrendingImage
);

// PATCH /trending-images/:id/status - Toggle active/inactive status
router.patch(
  "/:id/status",
  isAuthenticated,
  isAdmin("admin"),
  trendingImageController.toggleTrendingImageStatus
);

// DELETE /trending-images/:id - Delete trending item and cleanup file
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  trendingImageController.deleteTrendingImage
);

module.exports = router;
