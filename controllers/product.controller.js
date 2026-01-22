const {
  Product,
  Category,
  ProductVariant,
  VariantOption,
  VariantCategory,
} = require("../models");
const { upload } = require("../helpers/multer");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db"); // 👈 import your own instance
// Create a new product
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
  try {
    const { categoryId, trending_product, ...rest } = req.body;

    // Handle media files from multer
    const mediaFiles = req.files || [];

    // Create simple array of file paths with appropriate directory prefix
    const mediaPaths = mediaFiles.map((file) => {
      // For videos, add "videos/" prefix, for images just use filename
      return file.mimetype.startsWith("video/")
        ? `videos/${file.filename}`
        : file.filename;
    });

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid categoryId" });
    }

    // Convert tags from string to array if using form-data
    if (rest.tags && typeof rest.tags === "string") {
      rest.tags = rest.tags.split(",").map((tag) => tag.trim());
    }

    const trending = trending_product === "true";

    const product = await Product.create({
      trending_product: trending,
      categoryId,
      images: mediaPaths, // Store all paths in simple array
      ...rest,
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: { model: Category, attributes: ["id", "name"] },
    });

    res.status(201).json({ success: true, product: productWithCategory });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all products with category infoconst { Op } = require("sequelize");

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const categoryId = req.query.categoryId || null;
    const minPrice = req.query.minPrice || null;
    const maxPrice = req.query.maxPrice || null;
    const trending = req.query.trending || null;

    let where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        Sequelize.where(
          Sequelize.fn(
            "JSON_SEARCH",
            Sequelize.col("tags"),
            "one",
            `%${search}%`,
          ),
          { [Op.not]: null },
        ),
      ];
    }

    if (categoryId) where.categoryId = categoryId;

    if (minPrice && maxPrice) {
      where.discountPrice = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      where.discountPrice = { [Op.gte]: minPrice };
    } else if (maxPrice) {
      where.discountPrice = { [Op.lte]: maxPrice };
    }

    if (trending !== null) {
      where.trending_product = trending === "true";
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ["id", "name", "image"],
        },
        {
          model: ProductVariant,
          as: "ProductVariants",
          attributes: ["id", "sku", "price", "stock", "image", "isActive"],
          include: [
            {
              model: VariantOption,
              as: "options",
              attributes: ["id", "name", "value", "hexCode", "imageUrl"],
              include: [
                {
                  model: VariantCategory,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllProductsforAdmin = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const categoryId = req.query.categoryId || null;
    const minPrice = req.query.minPrice || null;
    const maxPrice = req.query.maxPrice || null;
    const trending = req.query.trending || null;

    // Where clause (filters)
    let where = {};

    // 🔍 Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        Sequelize.where(
          Sequelize.fn(
            "JSON_SEARCH",
            Sequelize.col("tags"),
            "one",
            `%${search}%`,
          ),
          { [Op.not]: null },
        ),
      ];
    }
    console.log("herwewe==>", categoryId);
    // 📂 Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 💰 Price range filter
    if (minPrice && maxPrice) {
      where.discountPrice = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      where.discountPrice = { [Op.gte]: minPrice };
    } else if (maxPrice) {
      where.discountPrice = { [Op.lte]: maxPrice };
    }

    // ⭐ Trending filter
    if (trending !== null) {
      where.trending_product = trending === "true";
    }

    // 🟢 Fetch paginated products
    // 🟢 Fetch paginated products
    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ["id", "name", "image"],
        },
        {
          model: ProductVariant,
          as: "ProductVariants",
          attributes: ["id", "sku", "price", "stock", "image", "isActive"],
          include: [
            {
              model: VariantOption,
              as: "options",
              attributes: ["id", "name", "value", "hexCode", "imageUrl"],
              include: [
                {
                  model: VariantCategory,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 📊 Fetch active/inactive/total counts in one grouped query
    const counts = await Product.findAll({
      attributes: [
        "isActive",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["isActive"],
      raw: true,
    });

    let activeCount = 0;
    let inactiveCount = 0;
    let totalCount = 0;

    counts.forEach((c) => {
      if (c.isActive) activeCount = parseInt(c.count);
      else inactiveCount = parseInt(c.count);
      totalCount += parseInt(c.count);
    });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit), // totalPages based on filtered count
      totalItems: count, // filtered total
      products,

      total: totalCount,
      activeProducts: activeCount,
      inactiveProducts: inactiveCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by ID with category
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: ProductVariant,
          as: "ProductVariants",
          attributes: ["id", "sku", "price", "stock", "image", "isActive"],
          include: [
            {
              model: VariantOption,
              as: "options",
              attributes: ["id", "name", "value", "hexCode", "imageUrl"],
              include: [
                {
                  model: VariantCategory,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle category validation if provided
    if (req.body.categoryId) {
      const category = await Category.findByPk(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }
    }

    // Parse media management data
    let existingMedia = [];
    let removedMedia = [];

    try {
      existingMedia = req.body.existingMedia
        ? JSON.parse(req.body.existingMedia)
        : [];
      removedMedia = req.body.removedMedia
        ? JSON.parse(req.body.removedMedia)
        : [];
    } catch (parseError) {
      console.error("Error parsing media data:", parseError);
      existingMedia = product.images || [];
      removedMedia = [];
    }

    // Handle media file cleanup - delete removed files from filesystem
    if (removedMedia.length > 0) {
      removedMedia.forEach((mediaPath) => {
        try {
          // For videos, path includes "videos/" prefix
          const fullPath = path.join(__dirname, "../uploads", mediaPath);

          // Check if file exists before trying to delete
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted media: ${mediaPath}`);
          }
        } catch (deleteError) {
          console.error(`Failed to delete media: ${mediaPath}`, deleteError);
          // Don't fail the entire update if media deletion fails
        }
      });
    }

    // Process new uploaded media files
    let newMediaPaths = [];
    if (req.files && req.files.length > 0) {
      newMediaPaths = req.files.map((file) => {
        // For videos, add "videos/" prefix, for images just use filename
        return file.mimetype.startsWith("video/")
          ? `videos/${file.filename}`
          : file.filename;
      });
    }

    // Combine existing media (that weren't removed) with new media
    const finalMedia = [
      ...existingMedia.filter((media) => !removedMedia.includes(media)),
      ...newMediaPaths,
    ];

    // Parse tags properly - handle multiple JSON encoding
    let parsedTags = [];
    if (req.body.tags) {
      try {
        let tags = req.body.tags;
        // Handle multiple levels of JSON encoding
        while (typeof tags === "string") {
          tags = JSON.parse(tags);
        }
        // Flatten if it's nested arrays and clean up
        if (Array.isArray(tags)) {
          parsedTags = tags
            .flat()
            .map((tag) =>
              typeof tag === "string" ? tag.replace(/['"\\]/g, "").trim() : tag,
            )
            .filter((tag) => tag && tag.length > 0);
        }
      } catch (parseError) {
        console.error("Tags parsing error:", parseError);
        // Fallback: split by comma if it's a simple string
        parsedTags =
          typeof req.body.tags === "string"
            ? req.body.tags.split(",").map((tag) => tag.trim())
            : [];
      }
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      categoryId: req.body.categoryId,
      tags: parsedTags,
      originalPrice: req.body.originalPrice,
      discountPrice: req.body.discountPrice,
      stock: req.body.stock,
      trending_product: req.body.trending_product === "true",
      paymentMethods: req.body.paymentMethods,
      varientValue: req?.body?.varientValue,
      images: finalMedia, // This now contains both images and videos
    };

    // Remove undefined/null values
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === undefined ||
        updateData[key] === null ||
        updateData[key] === ""
      ) {
        delete updateData[key];
      }
    });

    // Update the product
    await product.update(updateData);

    // Fetch updated product with relations
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    await product.destroy();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        trending_product: true,
      },
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// const { Product, Category } = require("../models");
// const { upload } = require("../helpers/multer");
// const { Op, Sequelize } = require("sequelize");
// const { sequelize } = require("../config/db"); // 👈 import your own instance
// // Create a new product
// exports.createProduct = async (req, res) => {
//   try {
//     const { categoryId, trending_product, variants, ...rest } = req.body;

//     // Handle images from multer
//     const imageFiles = req.files || [];
//     const images = imageFiles.map((file) => file.filename);

//     // Check category
//     const category = await Category.findByPk(categoryId);
//     if (!category)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid categoryId" });

//     // Convert tags
//     if (rest.tags && typeof rest.tags === "string") {
//       rest.tags = rest.tags.split(",").map((tag) => tag.trim());
//     }

//     const trending = trending_product === "true";

//     // Create product
//     const product = await Product.create({
//       trending_product: trending,
//       categoryId,
//       images,
//       ...rest,
//     });

//     // Create product variants if provided
//     if (variants && Array.isArray(variants)) {
//       for (let v of variants) {
//         await ProductVariant.create({
//           productId: product.id,
//           variantOptionIds: v.variantOptionIds, // [colorId, sizeId]
//           price: v.price,
//           stock: v.stock,
//         });
//       }
//     }

//     // Fetch product with category and variants
//     const productWithDetails = await Product.findByPk(product.id, {
//       include: [
//         { model: Category, attributes: ["id", "name"] },
//         { model: ProductVariant },
//       ],
//     });

//     res.status(201).json({ success: true, product: productWithDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Get all products with category infoconst { Op } = require("sequelize");

// exports.getAllProducts = async (req, res) => {
//   try {
//     // Query params
//     const page = parseInt(req.query.page) || 1; // page number
//     const limit = parseInt(req.query.limit) || 10; // items per page
//     const offset = (page - 1) * limit;

//     const search = req.query.search || ""; // search by name/desc
//     const categoryId = req.query.categoryId || null; // filter by category
//     const minPrice = req.query.minPrice || null; // filter min price
//     const maxPrice = req.query.maxPrice || null; // filter max price
//     const trending = req.query.trending || null; // filter trending products

//     // Where clause (filters)
//     let where = {};

//     // 🔍 Search filter (name OR description OR tags)
//     if (search) {
//       where[Op.or] = [
//         { name: { [Op.like]: `%${search}%` } },
//         { description: { [Op.like]: `%${search}%` } },
//         Sequelize.where(
//           Sequelize.fn(
//             "JSON_SEARCH",
//             Sequelize.col("tags"),
//             "one",
//             `%${search}%`
//           ),
//           { [Op.not]: null }
//         ),
//       ];
//     }

//     // 📂 Category filter
//     if (categoryId) {
//       where.categoryId = categoryId;
//     }

//     // 💰 Price range filter
//     if (minPrice && maxPrice) {
//       where.discountPrice = { [Op.between]: [minPrice, maxPrice] };
//     } else if (minPrice) {
//       where.discountPrice = { [Op.gte]: minPrice };
//     } else if (maxPrice) {
//       where.discountPrice = { [Op.lte]: maxPrice };
//     }

//     // ⭐ Trending product filter
//     if (trending !== null) {
//       where.trending_product = trending === "true";
//     }

//     // Fetch data
//     const { rows: products, count } = await Product.findAndCountAll({
//       where,
//       include: { model: Category, attributes: ["id", "name", "image"] },
//       limit,
//       offset,
//       order: [["createdAt", "DESC"]], // sort by latest
//     });

//     res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalPages: Math.ceil(count / limit),
//       totalItems: count,
//       products,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get single product by ID with category
// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id, {
//       include: { model: Category, attributes: ["id", "name"] },
//     });
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     res.status(200).json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update a product
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     // Optional: Check category if updated
//     if (req.body.categoryId) {
//       const category = await Category.findByPk(req.body.categoryId);
//       if (!category)
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid categoryId" });
//     }

//     await product.update(req.body);
//     res.status(200).json({ success: true, product });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete a product
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     await product.destroy();
//     res
//       .status(200)
//       .json({ success: true, message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getTrendingProducts = async (req, res) => {
//   try {
//     const products = await Product.findAll({
//       where: {
//         trending_product: true,
//       },
//     });
//     res.status(200).json({ success: true, products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
