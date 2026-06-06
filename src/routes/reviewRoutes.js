const express = require("express");
const router = express.Router();
const { createReview, getProductReviews, deleteReview, checkEligibility } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createReview);
router.get("/eligible/:productId", protect, checkEligibility);
router.get("/product/:productId", getProductReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;
