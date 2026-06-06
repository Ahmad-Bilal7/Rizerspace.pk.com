const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Check if a user is eligible to review a product
// @route   GET /api/reviews/eligible/:productId
// @access  Private
const checkEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 1. Enforce verified buyer status: must have a delivered order containing the product
    const order = await Order.findOne({
      customer: req.user._id,
      orderStatus: "Delivered",
      "items.product": productId
    });

    // 2. Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    res.json({
      eligible: !!order && !alreadyReviewed,
      reason: !order 
        ? "You must purchase and receive this product before writing a review." 
        : alreadyReviewed 
          ? "You have already reviewed this product." 
          : "Eligible"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Enforce verified buyer
    const order = await Order.findOne({
      customer: req.user._id,
      orderStatus: "Delivered",
      "items.product": productId
    });

    if (!order) {
      return res.status(400).json({ error: "Only verified buyers who have received this product can review it." });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ error: "Product already reviewed by you" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment: comment.trim()
    });

    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Validate ownership or admin status
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await review.deleteOne();

    // Trigger average rating recalculation
    await Review.calculateAverageRating(productId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEligibility,
  createReview,
  getProductReviews,
  deleteReview
};
