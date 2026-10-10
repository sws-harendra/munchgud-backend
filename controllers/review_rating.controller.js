const { Review, User, Product } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { Op } = require("sequelize");

// Helper to sync product average rating and review count
async function syncProductRating(productId) {
  try {
    if (!productId) return;
    const activeReviews = await Review.findAll({
      where: {
        productId,
        isDeleted: false,
      },
      attributes: ["rating"],
    });

    const total = activeReviews.length;
    const avg = total > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
      : null;

    await Product.update(
      {
        ratings: avg ? parseFloat(avg) : null,
      },
      { where: { id: productId } }
    );
  } catch (err) {
    console.error("Error syncing product rating:", err);
  }
}

// ✅ Add or Update Review & Rating (Logged-in User)
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
      return next(new ErrorHandler("Product ID and Rating are required", 400));
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating)));

    // Check if user already reviewed
    let review = await Review.findOne({
      where: {
        userId,
        productId,
        isDeleted: false,
      },
    });

    if (review) {
      // Update existing review
      await review.update({
        rating: numRating,
        comment: comment || "",
      });
    } else {
      // Create new review
      review = await Review.create({
        userId,
        productId,
        rating: numRating,
        comment: comment || "",
      });
    }

    // Update product rating cache
    await syncProductRating(productId);

    // Fetch review with user details for immediate client display
    const populatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "avatar", "email"],
          required: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully! Thank you for your feedback ⭐",
      review: populatedReview,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Get All Reviews of a Product (Public, Amazon/Flipkart breakdown)
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: {
        productId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "avatar"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const totalReviews = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    reviews.forEach((r) => {
      const star = r.rating;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
      ratingSum += star || 0;
    });

    const averageRating = totalReviews > 0
      ? parseFloat((ratingSum / totalReviews).toFixed(1))
      : 0;

    const percentages = {
      5: totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0,
      4: totalReviews > 0 ? Math.round((distribution[4] / totalReviews) * 100) : 0,
      3: totalReviews > 0 ? Math.round((distribution[3] / totalReviews) * 100) : 0,
      2: totalReviews > 0 ? Math.round((distribution[2] / totalReviews) * 100) : 0,
      1: totalReviews > 0 ? Math.round((distribution[1] / totalReviews) * 100) : 0,
    };

    res.json({
      success: true,
      totalReviews,
      averageRating,
      distribution,
      percentages,
      reviews,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Get Average Rating of Product (Public)
exports.getAverageRating = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const activeReviews = await Review.findAll({
      where: {
        productId,
        isDeleted: false,
      },
      attributes: ["rating"],
    });

    const totalReviews = activeReviews.length;
    const avg = totalReviews > 0
      ? parseFloat((activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    res.json({
      success: true,
      productId,
      averageRating: avg,
      totalReviews,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Update Review (Review Owner)
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByPk(req.params.id);

    if (!review || review.isDeleted) {
      return next(new ErrorHandler("Review not found", 404));
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorHandler("Not authorized to update this review", 403));
    }

    const numRating = rating ? Math.min(5, Math.max(1, parseInt(rating))) : review.rating;
    await review.update({ rating: numRating, comment: comment !== undefined ? comment : review.comment });

    await syncProductRating(review.productId);

    res.json({
      success: true,
      message: "Review updated successfully ✅",
      review,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Delete Review (Soft Delete - Owner or Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review || review.isDeleted) {
      return next(new ErrorHandler("Review not found", 404));
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorHandler("Not authorized to delete this review", 403));
    }

    review.isDeleted = true;
    await review.save();

    await syncProductRating(review.productId);

    res.json({
      success: true,
      message: "Review deleted successfully ✅",
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Admin: Get All Reviews with Search, Filters, and Analytics Stats
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const { search, rating, productId } = req.query;

    const where = { isDeleted: false };
    if (rating && !isNaN(parseInt(rating))) {
      where.rating = parseInt(rating);
    }
    if (productId && !isNaN(parseInt(productId))) {
      where.productId = parseInt(productId);
    }
    if (search && search.trim()) {
      where.comment = { [Op.like]: `%${search.trim()}%` };
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "email", "avatar"],
          required: false,
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "images"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    // Calculate overall stats across all active reviews
    const allActive = await Review.findAll({
      where: { isDeleted: false },
      attributes: ["rating", "productId"],
    });

    const totalActive = allActive.length;
    const avg = totalActive > 0
      ? parseFloat((allActive.reduce((sum, r) => sum + (r.rating || 0), 0) / totalActive).toFixed(1))
      : 0;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const productSet = new Set();
    allActive.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
      }
      if (r.productId) {
        productSet.add(r.productId);
      }
    });

    res.json({
      success: true,
      totalReviews: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      stats: {
        totalReviews: totalActive,
        averageRating: avg,
        ratingCounts,
        totalProductsReviewed: productSet.size,
      },
      reviews,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// ✅ Admin: Create Review (Seeding authentic customer feedback)
exports.createAdminReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      return next(new ErrorHandler("Product ID and Rating are required", 400));
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating)));
    const userId = req.user?.id || 1;

    const review = await Review.create({
      userId,
      productId: parseInt(productId),
      rating: numRating,
      comment: comment || "",
    });

    await syncProductRating(productId);

    const populatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "email", "avatar"],
          required: false,
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "images"],
          required: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully ✅",
      review: populatedReview,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};
