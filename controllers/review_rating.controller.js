const { Review, User, Product } = require("../models");
const ErrorHandler = require("../utils/errorHandler");
const { Op } = require("sequelize");


// ✅ Add Review & Rating
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id; // logged-in user

    // ✅ Check already reviewed
    const existingReview = await Review.findOne({
      where: {
        userId,
        productId,
        isDeleted: false,
      },
    });

    if (existingReview) {
      return next(
        new ErrorHandler("You already reviewed this product", 400),
      );
    }

    // ✅ Create Review
    const review = await Review.create({
      userId,
      productId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully ✅",
      review,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};



// ✅ Get All Reviews of a Product 
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
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};



// ✅ Get Average Rating of Product
exports.getAverageRating = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await Review.findAll({
      where: {
        productId,
        isDeleted: false,
      },
      attributes: [
        [Review.sequelize.fn("AVG", Review.sequelize.col("rating")), "avgRating"],
        [Review.sequelize.fn("COUNT", Review.sequelize.col("id")), "totalReviews"],
      ],
    });

    res.json({
      success: true,
      productId,
      averageRating: result[0].dataValues.avgRating,
      totalReviews: result[0].dataValues.totalReviews,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};



// ✅ Update Review
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByPk(req.params.id);

    if (!review || review.isDeleted) {
      return next(new ErrorHandler("Review not found", 404));
    }

    // ✅ Only owner can update
    if (review.userId !== req.user.id) {
      return next(new ErrorHandler("Not authorized", 403));
    }

    await review.update({ rating, comment });

    res.json({
      success: true,
      message: "Review updated successfully ✅",
      review,
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};



// ✅ Delete Review (Soft Delete)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review || review.isDeleted) {
      return next(new ErrorHandler("Review not found", 404));
    }

    // ✅ Only owner can delete
    if (review.userId !== req.user.id) {
      return next(new ErrorHandler("Not authorized", 403));
    }

    review.isDeleted = true;
    await review.save();

    res.json({
      success: true,
      message: "Review deleted successfully ✅",
    });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};
