const {
  VariantCategory,
  VariantOption,
  ProductVariant,
  Product,
} = require("../models");

// --- Variant Categories ---
exports.createVariantCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await VariantCategory.create({ name, description });
  res.status(201).json({ success: true, data: category });
};

exports.getAllVariantCategories = async (req, res) => {
  const categories = await VariantCategory.findAll({
    include: { model: VariantOption, as: "options" },
  });
  res.json({ success: true, data: categories });
};

// --- Variant Options ---
exports.createVariantOption = async (req, res) => {
  const { name, value, categoryId, hexCode, imageUrl } = req.body;
  const category = await VariantCategory.findByPk(categoryId);
  if (!category)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });

  const option = await VariantOption.create({
    name,
    value: name.toLowerCase(),
    categoryId,
    hexCode,
    imageUrl,
  });
  res.status(201).json({ success: true, data: option });
};

exports.getAllVariantOptions = async (req, res) => {
  const options = await VariantOption.findAll({
    include: { model: VariantCategory, as: "category" },
  });
  res.json({ success: true, data: options });
};

// --- Product Variants ---
exports.createProductVariant = async (req, res) => {
  try {
    const { productId } = req.params;

    // Handle files from upload.fields or upload.single
    let mediaPaths = [];
    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        mediaPaths.push(...req.files.images.map((f) => f.filename));
      }
      if (req.files.image && req.files.image.length > 0) {
        mediaPaths.push(...req.files.image.map((f) => f.filename));
      }
    } else if (req.file) {
      mediaPaths.push(req.file.filename);
    }

    const { price, originalPrice, stock, sku, optionIds, optionId } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create the variant
    const variant = await ProductVariant.create({
      productId,
      sku: sku && sku.trim() !== "" ? sku.trim() : undefined,
      price: price || 0,
      originalPrice: originalPrice ? originalPrice : null,
      stock: stock !== undefined ? Number(stock) : 0,
      image: mediaPaths[0] || null,
      images: mediaPaths,
    });

    // Associate with options if provided
    let targetOptionIds = [];
    if (optionIds) {
      try {
        targetOptionIds =
          typeof optionIds === "string" ? JSON.parse(optionIds) : optionIds;
        if (!Array.isArray(targetOptionIds)) targetOptionIds = [targetOptionIds];
      } catch {
        targetOptionIds = [optionIds];
      }
    } else if (optionId) {
      targetOptionIds = [optionId];
    }

    if (targetOptionIds.length > 0) {
      await variant.setOptions(targetOptionIds);
    }

    // Query the created variant with proper includes
    const result = await ProductVariant.findByPk(variant.id, {
      include: [
        {
          model: VariantOption,
          as: "options",
          through: { attributes: [] },
          include: [
            {
              model: VariantCategory,
              as: "category",
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating product variant:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.findAll({
      where: { productId },
      include: [
        {
          model: VariantOption,
          as: "options",
          through: { attributes: [] },
          include: [
            {
              model: VariantCategory,
              as: "category",
            },
          ],
        },
      ],
    });
    res.json({ success: true, data: variants });
  } catch (error) {
    console.error("Error fetching product variants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    await variant.destroy();

    res.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, price, originalPrice, stock, isActive } = req.body;

    let mediaPaths = [];
    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        mediaPaths.push(...req.files.images.map((f) => f.filename));
      }
      if (req.files.image && req.files.image.length > 0) {
        mediaPaths.push(...req.files.image.map((f) => f.filename));
      }
    } else if (req.file) {
      mediaPaths.push(req.file.filename);
    }

    const variant = await ProductVariant.findByPk(id);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    const updateData = {
      sku: sku !== undefined ? sku : variant.sku,
      price: price !== undefined ? price : variant.price,
      originalPrice:
        originalPrice !== undefined ? originalPrice : variant.originalPrice,
      stock: stock !== undefined ? Number(stock) : variant.stock,
      isActive: isActive !== undefined ? isActive : variant.isActive,
    };

    if (mediaPaths.length > 0) {
      updateData.image = mediaPaths[0];
      updateData.images = mediaPaths;
    }

    await variant.update(updateData);

    const updated = await ProductVariant.findByPk(id, {
      include: [
        {
          model: VariantOption,
          as: "options",
          through: { attributes: [] },
          include: [{ model: VariantCategory, as: "category" }],
        },
      ],
    });

    res.json({
      success: true,
      message: "Variant updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Delete Category
exports.deleteVariantCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await VariantCategory.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    await category.destroy();
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
};

// Delete Option
exports.deleteVariantOption = async (req, res) => {
  try {
    const { id } = req.params;
    const option = await VariantOption.findByPk(id);
    if (!option) {
      return res
        .status(404)
        .json({ success: false, message: "Option not found" });
    }
    await option.destroy();
    res.json({ success: true, message: "Option deleted" });
  } catch (err) {
    console.error("Delete Option Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete option" });
  }
};
