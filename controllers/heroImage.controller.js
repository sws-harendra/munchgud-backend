"use strict";

const { HeroImage } = require("../models");
const fs = require("fs");
const path = require("path");

// Helper to remove uploaded file if local
const deleteLocalFile = (filename) => {
  if (!filename || filename.startsWith("http") || filename.startsWith("/images/")) {
    return;
  }
  const cleanName = filename.replace(/^uploads\//, "");
  const filePath = path.join(__dirname, "../uploads", cleanName);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Failed to delete file:", filePath, err.message);
  }
};

// 1. GET /hero-images - Public endpoint for Homepage slider
exports.getHeroImages = async (req, res) => {
  try {
    // Ensure table exists safely
    await HeroImage.sync();

    const heroImages = await HeroImage.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["id", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: heroImages.length,
      data: heroImages,
    });
  } catch (err) {
    console.error("Error in getHeroImages:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. GET /hero-images/admin/all - Admin endpoint to list all slides with statistics
exports.getAllHeroImagesAdmin = async (req, res) => {
  try {
    await HeroImage.sync();

    const heroImages = await HeroImage.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["id", "ASC"],
      ],
    });

    const total = heroImages.length;
    const active = heroImages.filter((img) => img.isActive).length;
    const inactive = total - active;

    res.status(200).json({
      success: true,
      stats: { total, active, inactive },
      data: heroImages,
    });
  } catch (err) {
    console.error("Error in getAllHeroImagesAdmin:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. GET /hero-images/:id - Get single hero image
exports.getHeroImageById = async (req, res) => {
  try {
    const heroImage = await HeroImage.findByPk(req.params.id);
    if (!heroImage) {
      return res.status(404).json({ success: false, error: "Hero image not found" });
    }
    res.status(200).json({ success: true, data: heroImage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. POST /hero-images - Create new hero image
exports.createHeroImage = async (req, res) => {
  try {
    await HeroImage.sync();

    const { title, subtitle, link, ctaText, altText, displayOrder, isActive } = req.body;

    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Hero image file is required.",
      });
    }

    const imageFilename = req.file ? req.file.filename : req.body.imageUrl;

    // Calculate display order if not passed
    let order = displayOrder !== undefined && displayOrder !== "" ? parseInt(displayOrder, 10) : null;
    if (order === null || isNaN(order)) {
      const maxOrder = await HeroImage.max("displayOrder");
      order = (maxOrder || 0) + 1;
    }

    const heroImage = await HeroImage.create({
      title: title?.trim() || null,
      subtitle: subtitle?.trim() || null,
      imageUrl: imageFilename,
      link: link?.trim() || "#flagship-series",
      ctaText: ctaText?.trim() || null,
      altText: altText?.trim() || title?.trim() || "Flazo Hero Slide",
      displayOrder: order,
      isActive: isActive === undefined ? true : String(isActive) === "true",
    });

    res.status(201).json({
      success: true,
      message: "Hero slide image uploaded successfully!",
      data: heroImage,
    });
  } catch (err) {
    console.error("Error in createHeroImage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. PUT /hero-images/:id - Update existing hero image
exports.updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const heroImage = await HeroImage.findByPk(id);

    if (!heroImage) {
      return res.status(404).json({ success: false, error: "Hero image not found" });
    }

    const { title, subtitle, link, ctaText, altText, displayOrder, isActive } = req.body;

    let newImageUrl = heroImage.imageUrl;

    // If new image was uploaded, remove previous custom file if local
    if (req.file) {
      deleteLocalFile(heroImage.imageUrl);
      newImageUrl = req.file.filename;
    } else if (req.body.imageUrl) {
      newImageUrl = req.body.imageUrl;
    }

    await heroImage.update({
      title: title !== undefined ? (title?.trim() || null) : heroImage.title,
      subtitle: subtitle !== undefined ? (subtitle?.trim() || null) : heroImage.subtitle,
      imageUrl: newImageUrl,
      link: link !== undefined ? (link?.trim() || null) : heroImage.link,
      ctaText: ctaText !== undefined ? (ctaText?.trim() || null) : heroImage.ctaText,
      altText: altText !== undefined ? (altText?.trim() || null) : heroImage.altText,
      displayOrder:
        displayOrder !== undefined && displayOrder !== ""
          ? parseInt(displayOrder, 10)
          : heroImage.displayOrder,
      isActive:
        isActive !== undefined ? String(isActive) === "true" : heroImage.isActive,
    });

    res.status(200).json({
      success: true,
      message: "Hero image updated successfully!",
      data: heroImage,
    });
  } catch (err) {
    console.error("Error in updateHeroImage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. PATCH /hero-images/:id/status - Toggle active/inactive status
exports.toggleHeroImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const heroImage = await HeroImage.findByPk(id);

    if (!heroImage) {
      return res.status(404).json({ success: false, error: "Hero image not found" });
    }

    const updatedStatus = !heroImage.isActive;
    await heroImage.update({ isActive: updatedStatus });

    res.status(200).json({
      success: true,
      message: `Hero image ${updatedStatus ? "activated" : "deactivated"} successfully!`,
      data: heroImage,
    });
  } catch (err) {
    console.error("Error in toggleHeroImageStatus:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 7. PUT /hero-images/reorder/bulk - Bulk reorder slides
exports.reorderHeroImages = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "Items array is required" });
    }

    for (const item of items) {
      if (item.id && typeof item.displayOrder === "number") {
        await HeroImage.update(
          { displayOrder: item.displayOrder },
          { where: { id: item.id } }
        );
      }
    }

    const updated = await HeroImage.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["id", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      message: "Hero slides reordered successfully!",
      data: updated,
    });
  } catch (err) {
    console.error("Error in reorderHeroImages:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 8. DELETE /hero-images/:id - Delete hero image
exports.deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const heroImage = await HeroImage.findByPk(id);

    if (!heroImage) {
      return res.status(404).json({ success: false, error: "Hero image not found" });
    }

    // Unlink local upload file
    deleteLocalFile(heroImage.imageUrl);

    await heroImage.destroy();

    res.status(200).json({
      success: true,
      message: "Hero image deleted successfully!",
      deletedId: parseInt(id, 10),
    });
  } catch (err) {
    console.error("Error in deleteHeroImage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
