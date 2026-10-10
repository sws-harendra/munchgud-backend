const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const reviewController = require("../controllers/review_rating.controller");
const catchAsyncErrors = require("../middleware/catchError");

// ==========================================
// 🛒 USER / PUBLIC ROUTES
// ==========================================

// ✅ Add Review & Rating (User must be logged in)
router.post(
  "/add-review",
  isAuthenticated,
  catchAsyncErrors(reviewController.addReview)
);

// ✅ Get All Reviews of a Product (Public)
router.get(
  "/product-reviews/:productId",
  catchAsyncErrors(reviewController.getProductReviews)
);

// ✅ Get Average Rating of a Product (Public)
router.get(
  "/average-rating/:productId",
  catchAsyncErrors(reviewController.getAverageRating)
);

// ✅ Update Review (Only Review Owner or Admin)
router.put(
  "/update-review/:id",
  isAuthenticated,
  catchAsyncErrors(reviewController.updateReview)
);

// ✅ Delete Review (Soft Delete - Review Owner or Admin)
router.delete(
  "/delete-review/:id",
  isAuthenticated,
  catchAsyncErrors(reviewController.deleteReview)
);

// ==========================================
// 🛡️ ADMIN MANAGEMENT ROUTES
// ==========================================

// ✅ Admin: Get All Reviews with Pagination, Search, Filter & Stats
router.get(
  "/admin/all-reviews",
  isAuthenticated,
  isAdmin("admin", "Admin"),
  catchAsyncErrors(reviewController.getAllReviewsAdmin)
);

// ✅ Admin: Create / Seed a Review
router.post(
  "/admin/add-review",
  isAuthenticated,
  isAdmin("admin", "Admin"),
  catchAsyncErrors(reviewController.createAdminReview)
);

// ✅ Admin: Delete Review
router.delete(
  "/admin/delete-review/:id",
  isAuthenticated,
  isAdmin("admin", "Admin"),
  catchAsyncErrors(reviewController.deleteReview)
);

module.exports = router;
