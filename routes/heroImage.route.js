"use strict";

const express = require("express");
const router = express.Router();
const heroImageController = require("../controllers/heroImage.controller");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { upload } = require("../helpers/multer");

// =============================================================================
// PUBLIC ROUTES
// =============================================================================
// GET /hero-images - Fetch active slides for Homepage slider
router.get("/", heroImageController.getHeroImages);

// =============================================================================
// ADMIN PROTECTED ROUTES
// =============================================================================
// GET /hero-images/admin/all - Get all slides with stats
router.get(
  "/admin/all",
  isAuthenticated,
  isAdmin("admin"),
  heroImageController.getAllHeroImagesAdmin
);

// PUT /hero-images/reorder/bulk - Reorder slides
router.put(
  "/reorder/bulk",
  isAuthenticated,
  isAdmin("admin"),
  heroImageController.reorderHeroImages
);

// GET /hero-images/:id - Get single slide
router.get(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  heroImageController.getHeroImageById
);

// POST /hero-images - Upload and create new hero slide image
router.post(
  "/",
  isAuthenticated,
  isAdmin("admin"),
  upload.single("image"),
  heroImageController.createHeroImage
);

// PUT /hero-images/:id - Update slide details and/or replace image
router.put(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  upload.single("image"),
  heroImageController.updateHeroImage
);

// PATCH /hero-images/:id/status - Toggle active/inactive status
router.patch(
  "/:id/status",
  isAuthenticated,
  isAdmin("admin"),
  heroImageController.toggleHeroImageStatus
);

// DELETE /hero-images/:id - Delete slide and clean up image file
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  heroImageController.deleteHeroImage
);

module.exports = router;
