const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/isAuthenticated");
const reviewController = require("../controllers/review_rating.controller");
const catchAsyncErrors = require("../middleware/catchError");


// ✅ Add Review (User must be logged in)
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


// ✅ Update Review (Only Review Owner)
router.put(
  "/update-review/:id",
  isAuthenticated,
  catchAsyncErrors(reviewController.updateReview)
);


// ✅ Delete Review (Soft Delete)
router.delete(
  "/delete-review/:id",
  isAuthenticated,
  catchAsyncErrors(reviewController.deleteReview)
);

module.exports = router;
