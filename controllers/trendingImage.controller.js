"use strict";

const { TrendingImage, Product, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const defaultTrendingItems = [
  {
    name: "Flazo Nirvana Ion ANC",
    badge: "✨ Engraving Available",
    badgeBg: "bg-amber-950 text-amber-300",
    imageUrl: "/images/hero-earbuds.jpg",
    featureBar: "120 Hours Playback",
    rating: 4.9,
    price: 2399,
    originalPrice: 9990,
    discount: "76% off",
    colors: JSON.stringify(["#FFFFFF", "#D4AF37", "#1A1A1A"]),
    extraColorsCount: 2,
    link: "#flagship-series",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Flazo Airdopes 181 Pro",
    badge: "🎁 Free Spotify",
    badgeBg: "bg-neutral-900 text-yellow-300",
    imageUrl: "/images/spotlight-earbud.jpg",
    featureBar: "100 Hours Playback",
    rating: 4.8,
    price: 1499,
    originalPrice: 4990,
    discount: "70% off",
    colors: JSON.stringify(["#F5DE98", "#FFFFFF"]),
    extraColorsCount: 2,
    link: "#flagship-series",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Flazo Wave Fury Gold",
    badge: "🚀 Bestseller",
    badgeBg: "bg-neutral-950 text-white",
    imageUrl: "/images/watch-gold.jpg",
    featureBar: "BT Calling & AMOLED",
    rating: 4.9,
    price: 2299,
    originalPrice: 6999,
    discount: "67% off",
    colors: JSON.stringify(["#E5C158", "#1A1A1A"]),
    extraColorsCount: 3,
    link: "#flagship-series",
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Flazo Rockerz 110 Gold",
    badge: "🔥 New Launch",
    badgeBg: "bg-neutral-950 text-amber-300",
    imageUrl: "/images/neckband-gold.jpg",
    featureBar: "40 Hours Playback",
    rating: 4.8,
    price: 999,
    originalPrice: 2490,
    discount: "60% off",
    colors: JSON.stringify(["#F5DE98", "#2D2D2D"]),
    extraColorsCount: 1,
    link: "#flagship-series",
    displayOrder: 4,
    isActive: true,
  },
  {
    name: "Flazo BassPod Extreme",
    badge: "⚡ 35ms Beast™",
    badgeBg: "bg-amber-900 text-amber-300",
    imageUrl: "/images/lineup-showcase.jpg",
    featureBar: "Signature Beast Mode",
    rating: 4.9,
    price: 1799,
    originalPrice: 5490,
    discount: "67% off",
    colors: JSON.stringify(["#FFFFFF", "#D4AF37"]),
    extraColorsCount: 0,
    link: "#flagship-series",
    displayOrder: 5,
    isActive: true,
  },
  {
    name: "Flazo Immortal 131 Gaming",
    badge: "🎮 Ultra Low Latency",
    badgeBg: "bg-neutral-950 text-amber-300",
    imageUrl: "/images/lifestyle-model.jpg",
    featureBar: "RGB Case & 40ms",
    rating: 4.7,
    price: 1299,
    originalPrice: 3990,
    discount: "67% off",
    colors: JSON.stringify(["#1A1A1A", "#E5C158"]),
    extraColorsCount: 1,
    link: "#flagship-series",
    displayOrder: 6,
    isActive: true,
  },
];

// Helper to remove local uploaded file
const deleteUploadedFile = (fileRelPath) => {
  if (!fileRelPath) return;
  if (fileRelPath.startsWith("/uploads/") || fileRelPath.startsWith("uploads/")) {
    const filename = path.basename(fileRelPath);
    const fullPath = path.join(__dirname, "..", "uploads", filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error("Failed to delete file:", fullPath, err);
      }
    }
  }
};

// Seed default items if table is completely empty on initial request
const seedDefaultsIfEmpty = async () => {
  try {
    const count = await TrendingImage.count();
    if (count === 0) {
      await TrendingImage.bulkCreate(defaultTrendingItems);
    }
  } catch (err) {
    console.error("Error checking/seeding default trending items:", err);
  }
};

// =============================================================================
// PUBLIC CONTROLLERS
// =============================================================================

/**
 * GET /trending-images
 * Public endpoint to fetch active trending items for the storefront
 */
exports.getTrendingImages = async (req, res) => {
  try {
    await seedDefaultsIfEmpty();

    const items = await TrendingImage.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "discountPrice", "originalPrice", "images"],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error in getTrendingImages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending images",
      error: error.message,
    });
  }
};

// =============================================================================
// ADMIN CONTROLLERS
// =============================================================================

/**
 * GET /trending-images/admin/all
 * Admin endpoint to fetch all items (active & inactive) with statistics
 */
exports.getAllTrendingImagesAdmin = async (req, res) => {
  try {
    await seedDefaultsIfEmpty();

    const items = await TrendingImage.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "discountPrice", "originalPrice", "images"],
          required: false,
        },
      ],
    });

    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const inactive = total - active;
    const avgPrice = total > 0 ? Math.round(items.reduce((acc, cur) => acc + (cur.price || 0), 0) / total) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        avgPrice,
      },
      data: items,
    });
  } catch (error) {
    console.error("Error in getAllTrendingImagesAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin trending images",
      error: error.message,
    });
  }
};

/**
 * GET /trending-images/:id
 * Admin endpoint to fetch a single trending item
 */
exports.getTrendingImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TrendingImage.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "discountPrice", "originalPrice", "images"],
          required: false,
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Trending item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error in getTrendingImageById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending item",
      error: error.message,
    });
  }
};

/**
 * POST /trending-images
 * Admin endpoint to create a new trending item
 */
exports.createTrendingImage = async (req, res) => {
  try {
    const {
      name,
      badge,
      badgeBg,
      featureBar,
      rating,
      price,
      originalPrice,
      discount,
      colors,
      extraColorsCount,
      link,
      productId,
      displayOrder,
      isActive,
      imageUrl: explicitImageUrl,
    } = req.body;

    let imageUrl = explicitImageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image is required (either upload a file or provide an imageUrl)",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Determine display order if not specified
    let orderNum = Number(displayOrder);
    if (isNaN(orderNum)) {
      const maxOrder = await TrendingImage.max("displayOrder");
      orderNum = (maxOrder || 0) + 1;
    }

    // Auto-compute discount if missing
    let computedDiscount = discount;
    const pVal = Number(price) || 0;
    const origVal = Number(originalPrice) || 0;
    if (!computedDiscount && origVal > pVal && origVal > 0) {
      computedDiscount = `${Math.round(((origVal - pVal) / origVal) * 100)}% off`;
    }

    // Format colors JSON
    let colorsJson = colors;
    if (Array.isArray(colors)) {
      colorsJson = JSON.stringify(colors);
    } else if (typeof colors === "string" && !colors.startsWith("[")) {
      colorsJson = JSON.stringify(colors.split(",").map((c) => c.trim()).filter(Boolean));
    }

    const newItem = await TrendingImage.create({
      name,
      badge: badge || "🔥 Bestseller",
      badgeBg: badgeBg || "bg-neutral-950 text-white",
      imageUrl,
      featureBar: featureBar || "Signature Sound",
      rating: Number(rating) || 4.9,
      price: pVal,
      originalPrice: origVal || null,
      discount: computedDiscount || null,
      colors: colorsJson || '["#FFFFFF", "#D4AF37", "#1A1A1A"]',
      extraColorsCount: Number(extraColorsCount) || 0,
      link: link || "#bestsellers",
      productId: productId ? Number(productId) : null,
      displayOrder: orderNum,
      isActive: isActive === undefined ? true : String(isActive) === "true" || isActive === true,
    });

    return res.status(201).json({
      success: true,
      message: "Trending item created successfully",
      data: newItem,
    });
  } catch (error) {
    console.error("Error in createTrendingImage:", error);
    if (req.file) {
      deleteUploadedFile(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create trending item",
      error: error.message,
    });
  }
};

/**
 * PUT /trending-images/:id
 * Admin endpoint to update a trending item
 */
exports.updateTrendingImage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TrendingImage.findByPk(id);

    if (!item) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({
        success: false,
        message: "Trending item not found",
      });
    }

    const {
      name,
      badge,
      badgeBg,
      featureBar,
      rating,
      price,
      originalPrice,
      discount,
      colors,
      extraColorsCount,
      link,
      productId,
      displayOrder,
      isActive,
      imageUrl: explicitImageUrl,
    } = req.body;

    let updatedImageUrl = item.imageUrl;
    let oldImageToDelete = null;

    if (req.file) {
      updatedImageUrl = `/uploads/${req.file.filename}`;
      if (item.imageUrl && item.imageUrl !== updatedImageUrl) {
        oldImageToDelete = item.imageUrl;
      }
    } else if (explicitImageUrl && explicitImageUrl !== item.imageUrl) {
      updatedImageUrl = explicitImageUrl;
      if (item.imageUrl && item.imageUrl.startsWith("/uploads/")) {
        oldImageToDelete = item.imageUrl;
      }
    }

    // Auto-compute discount if price changed
    const pVal = price !== undefined ? Number(price) : item.price;
    const origVal = originalPrice !== undefined ? Number(originalPrice) : item.originalPrice;
    let computedDiscount = discount !== undefined ? discount : item.discount;
    if ((discount === undefined || !discount) && origVal > pVal && origVal > 0) {
      computedDiscount = `${Math.round(((origVal - pVal) / origVal) * 100)}% off`;
    }

    // Format colors JSON
    let colorsJson = item.colors;
    if (colors !== undefined) {
      if (Array.isArray(colors)) {
        colorsJson = JSON.stringify(colors);
      } else if (typeof colors === "string" && !colors.startsWith("[")) {
        colorsJson = JSON.stringify(colors.split(",").map((c) => c.trim()).filter(Boolean));
      } else {
        colorsJson = colors;
      }
    }

    await item.update({
      name: name !== undefined ? name : item.name,
      badge: badge !== undefined ? badge : item.badge,
      badgeBg: badgeBg !== undefined ? badgeBg : item.badgeBg,
      imageUrl: updatedImageUrl,
      featureBar: featureBar !== undefined ? featureBar : item.featureBar,
      rating: rating !== undefined ? Number(rating) : item.rating,
      price: pVal,
      originalPrice: origVal,
      discount: computedDiscount,
      colors: colorsJson,
      extraColorsCount: extraColorsCount !== undefined ? Number(extraColorsCount) : item.extraColorsCount,
      link: link !== undefined ? link : item.link,
      productId: productId !== undefined ? (productId ? Number(productId) : null) : item.productId,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : item.displayOrder,
      isActive: isActive !== undefined ? String(isActive) === "true" || isActive === true : item.isActive,
    });

    if (oldImageToDelete) {
      deleteUploadedFile(oldImageToDelete);
    }

    return res.status(200).json({
      success: true,
      message: "Trending item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error in updateTrendingImage:", error);
    if (req.file) {
      deleteUploadedFile(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update trending item",
      error: error.message,
    });
  }
};

/**
 * PATCH /trending-images/:id/status
 * Admin endpoint to toggle active/inactive status
 */
exports.toggleTrendingImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TrendingImage.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Trending item not found",
      });
    }

    item.isActive = !item.isActive;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Item status updated to ${item.isActive ? "active" : "inactive"}`,
      data: item,
    });
  } catch (error) {
    console.error("Error in toggleTrendingImageStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle status",
      error: error.message,
    });
  }
};

/**
 * DELETE /trending-images/:id
 * Admin endpoint to delete a trending item and cleanup file
 */
exports.deleteTrendingImage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TrendingImage.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Trending item not found",
      });
    }

    const imgToDelete = item.imageUrl;
    await item.destroy();

    deleteUploadedFile(imgToDelete);

    return res.status(200).json({
      success: true,
      message: "Trending item deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTrendingImage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete trending item",
      error: error.message,
    });
  }
};

/**
 * PUT /trending-images/reorder/bulk
 * Admin endpoint to bulk reorder trending items
 */
exports.reorderTrendingImages = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { items } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Array of items with id and displayOrder is required",
      });
    }

    for (const item of items) {
      await TrendingImage.update(
        { displayOrder: Number(item.displayOrder) },
        { where: { id: item.id }, transaction }
      );
    }

    await transaction.commit();

    const updatedItems = await TrendingImage.findAll({
      order: [["displayOrder", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Trending items reordered successfully",
      data: updatedItems,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in reorderTrendingImages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder items",
      error: error.message,
    });
  }
};
