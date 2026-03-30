// Create Banner
const { Banner, Category } = require("../models");

exports.createBanner = async (req, res) => {
  try {
    const { categoryId, title, subtitle, link, ctaText } = req.body;
    const image = req.file ? req.file.filename : null;

    let category = null;

    if (categoryId) {
      category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const banner = await Banner.create({
      categoryId: categoryId || null,
      title: title || null,
      subtitle: subtitle || null,
      imageUrl: image || null,
      link: link || null,
      ctaText: ctaText || null,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ include: Category });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id, { include: Category });
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    // Extract body fields (strings from FormData)
    const { title, subtitle, ctaText, link, categoryId } = req.body;

    // If an image was uploaded
    let imageUrl = banner.imageUrl;
    if (req.file) {
      imageUrl = req.file.filename; // or `req.file.path` depending on config
    }

    await banner.update({
      title: title || banner.title,
      subtitle: subtitle || banner.subtitle,
      ctaText: ctaText || banner.ctaText,
      link: link || banner.link,
      categoryId: categoryId
        ? parseInt(categoryId, 10)
        : banner.categoryId,
      imageUrl: imageUrl || banner.imageUrl,
    });

    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    await banner.destroy();
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
