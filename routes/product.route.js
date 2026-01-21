const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const { upload } = require("../helpers/multer");
const { uploadMedia } = require("../helpers/multerImageVideo");

// CRUD routes
router.post(
  "/",
  uploadMedia.array("media", 10), 

  isAuthenticated,
  isAdmin("admin"),
  productController.createProduct
); // Create
router.get("/", productController.getAllProducts); // Read all
router.get(
  "/forAdmin",
  isAuthenticated,
  isAdmin("admin"),
  productController.getAllProductsforAdmin
); // Read all

router.get("/trending-products", productController.getTrendingProducts); // Read all

router.get("/:id", productController.getProductById); // Read one
router.put(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  uploadMedia.array("media", 10), // "media" field name, max 10 files
  productController.updateProduct
); // Update
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin("admin"),
  productController.deleteProduct
); // Delete

// router.post(
//   "/category",
//   isAuthenticated,
//   isAdmin("admin"),
//   productController.createVariantCategory
// );

// // Get all variant categories
// router.get("/categories", productController.getAllVariantCategories);

// // Create a new variant option (e.g., Red under Color)
// router.post(
//   "/option",
//   isAuthenticated,
//   isAdmin("admin"),
//   productController.createVariantOption
// );

// // Get all variant options (optionally by categoryId)
// router.get("/options", productController.getAllVariantOptions);

module.exports = router;
