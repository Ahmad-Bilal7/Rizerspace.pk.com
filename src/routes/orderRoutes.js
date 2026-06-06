const express = require("express");
const router = express.Router();
const {
  placeOrder,
  createStripeSession,
  verifyStripePayment,
  getPaymentInfo,
  adminVerifyPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetOrders,
  adminUpdateOrderStatus
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

// Customer routes
router.get("/payment-info", protect, getPaymentInfo);
router.post("/", protect, placeOrder);
router.post("/stripe-session", protect, createStripeSession);
router.post("/verify-stripe", protect, verifyStripePayment);
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, admin, adminGetOrders);
router.put("/:id/status", protect, admin, adminUpdateOrderStatus);
router.put("/:id/verify-payment", protect, admin, adminVerifyPayment);

module.exports = router;
