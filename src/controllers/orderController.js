const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const { createNotification } = require("../utils/notification");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Generate a human-readable payment reference for manual wallet payments
const generatePaymentRef = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RZ-PAY-${rand}`;
};

// ─── Helper: build verified order items from DB ───────────────────────────────
const buildOrderItems = async (items) => {
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw { status: 404, message: `Product not found: ${item.product}` };
    if (product.stock < item.quantity) throw { status: 400, message: `Insufficient stock for: ${product.title}` };

    const price = product.discountedPrice || product.price;
    total += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.title,
      image: product.images?.[0] || "",
      quantity: item.quantity,
      price
    });
  }
  return { orderItems, total };
};

// ─── Helper: apply coupon discount ───────────────────────────────────────────
const applyCoupon = async (code, total) => {
  if (!code) return { discount: 0, couponCode: null };
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon || coupon.expiryDate < new Date()) return { discount: 0, couponCode: null };
  return {
    discount: Math.round((total * coupon.discount) / 100 * 100) / 100,
    couponCode: coupon.code
  };
};

// ─── Decrement stock after order placed ──────────────────────────────────────
const decrementStock = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
};

// @desc    Get payment wallet numbers from environment variables
// @route   GET /api/orders/payment-info
// @access  Private
const getPaymentInfo = async (req, res, next) => {
  try {
    res.json({
      data: {
        easyPaisaNumber: process.env.EASYPAISA_NUMBER || "+92 345 1470780",
        jazzCashNumber: process.env.JAZZCASH_NUMBER || "+92 345 1470780"
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Place a COD or wallet (JazzCash/EasyPaisa) order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  const {
    items,
    contactName,
    contactEmail,
    contactPhone,
    shippingAddress,
    paymentMethod,
    transactionId,
    couponCode
  } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }
    if (!["COD", "JazzCash", "EasyPaisa"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const { orderItems, total } = await buildOrderItems(items);
    const { discount, couponCode: appliedCode } = await applyCoupon(couponCode, total);
    const finalAmount = Math.max(0, total - discount);

    const isWallet = ["JazzCash", "EasyPaisa"].includes(paymentMethod);
    const paymentRef = isWallet ? generatePaymentRef() : undefined;

    const order = await Order.create({
      orderId: `RZ-${Date.now()}`,
      customer: req.user._id,
      items: orderItems,
      contactName,
      contactEmail,
      contactPhone,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Pending",
      paymentReference: paymentRef,
      transactionId: isWallet ? (transactionId || null) : undefined,
      couponCode: appliedCode,
      discountAmount: discount,
      totalAmount: finalAmount,
      orderStatus: paymentMethod === "COD" ? "Confirmed" : "Pending"
    });

    // Decrement stock immediately for COD/Manual wallets
    await decrementStock(orderItems);

    // Create notifications
    await createNotification({
      user: req.user._id,
      title: "Order Placed",
      message: `Your order #${order.orderId} has been placed.`,
      type: "order"
    });
    await createNotification({
      isAdmin: true,
      title: "New Order",
      message: "New order received.",
      type: "order"
    });

    if (isWallet) {
      await createNotification({
        isAdmin: true,
        title: `New ${paymentMethod} Payment`,
        message: `New ${paymentMethod} payment awaiting verification.`,
        type: "payment"
      });
    }

    res.status(201).json({ data: order });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// @desc    Create a Stripe hosted checkout session
// @route   POST /api/orders/stripe-session
// @access  Private
const createStripeSession = async (req, res, next) => {
  const {
    items,
    contactName,
    contactEmail,
    contactPhone,
    shippingAddress,
    couponCode
  } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env" });
    }

    const { orderItems, total } = await buildOrderItems(items);
    const { discount, couponCode: appliedCode } = await applyCoupon(couponCode, total);
    const finalAmount = Math.max(0, total - discount);

    // Create a pending order (do NOT decrement stock yet)
    const order = await Order.create({
      orderId: `RZ-${Date.now()}`,
      customer: req.user._id,
      items: orderItems,
      contactName,
      contactEmail,
      contactPhone,
      shippingAddress,
      paymentMethod: "Stripe",
      paymentStatus: "Pending",
      couponCode: appliedCode,
      discountAmount: discount,
      totalAmount: finalAmount,
      orderStatus: "Pending"
    });

    const description = orderItems.map(i => `${i.name} (x${i.quantity})`).join(", ");

    // Stripe hosted Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RizerSpace Order #${order.orderId}`,
              description: description.substring(0, 500)
            },
            unit_amount: Math.round(finalAmount * 100) // in cents
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/orders/${order._id}?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?cancelled=1`,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order.orderId
      }
    });

    // Save Stripe session reference
    order.stripeSessionId = session.id;
    order.paymentReference = session.id;
    await order.save();

    res.json({ checkoutUrl: session.url, orderId: order._id });
  } catch (error) {
    console.error("Stripe session creation error:", error.message);
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// @desc    Verify Stripe payment after redirect
// @route   POST /api/orders/verify-stripe
// @access  Private
const verifyStripePayment = async (req, res, next) => {
  const { orderId, sessionId } = req.body;

  try {
    if (!orderId || !sessionId) {
      return res.status(400).json({ error: "orderId and sessionId are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus === "Paid") {
      return res.json({ data: order }); // Idempotency check
    }

    if (order.paymentReference !== sessionId && order.stripeSessionId !== sessionId) {
      return res.status(400).json({ error: "Invalid Stripe session ID for this order" });
    }

    // Call Stripe API to retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: `Payment not completed. Stripe Status: ${session.payment_status}` });
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    await order.save();

    // Reduce stock ONLY after successful payment verification!
    await decrementStock(order.items);

    // Create notifications
    await createNotification({
      user: order.customer,
      title: "Payment Verified",
      message: "Your payment has been verified.",
      type: "payment"
    });
    await createNotification({
      user: order.customer,
      title: "Order Placed",
      message: `Your order #${order.orderId} has been placed.`,
      type: "order"
    });
    await createNotification({
      isAdmin: true,
      title: "New Order",
      message: "New order received.",
      type: "order"
    });

    res.json({ data: order });
  } catch (error) {
    console.error("Stripe payment verification error:", error.message);
    next(error);
  }
};

// @desc    Admin: verify a manual wallet payment (JazzCash / EasyPaisa)
// @route   PUT /api/orders/:id/verify-payment
// @access  Private/Admin
const adminVerifyPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!["JazzCash", "EasyPaisa"].includes(order.paymentMethod)) {
      return res.status(400).json({ error: "Only wallet payments can be manually verified" });
    }

    if (order.paymentStatus === "Paid") {
      return res.json({ data: order });
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    await order.save();

    // Create notifications
    await createNotification({
      user: order.customer,
      title: "Payment Verified",
      message: "Your payment has been verified.",
      type: "payment"
    });

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.product", "title images category")
      .sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("items.product", "title images category");

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Verify ownership
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    // Allowed cancellation statuses
    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    // Restore stock quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    // Create notifications
    await createNotification({
      user: order.customer,
      title: "Order Cancelled",
      message: `Your order #${order.orderId} has been cancelled.`,
      type: "order"
    });
    await createNotification({
      isAdmin: true,
      title: "Order Cancelled",
      message: "Order cancelled by customer.",
      type: "order"
    });

    res.json({ message: "Order cancelled successfully", data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("customer", "name email")
      .populate("items.product", "title category price")
      .sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const adminUpdateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

  try {
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const oldStatus = order.orderStatus;
    if (oldStatus === status) {
      return res.json({ data: order });
    }

    order.orderStatus = status;
    if (status === "Delivered" && order.paymentStatus === "Pending" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    // Restore stock if transitioning to Cancelled
    if (status === "Cancelled" && oldStatus !== "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    // Create notifications based on transitions
    if (status === "Confirmed") {
      await createNotification({
        user: order.customer,
        title: "Order Confirmed",
        message: `Your order #${order.orderId} has been placed.`,
        type: "order"
      });
    } else if (status === "Shipped") {
      await createNotification({
        user: order.customer,
        title: "Order Shipped",
        message: "Your order has been shipped.",
        type: "order"
      });
    } else if (status === "Delivered") {
      await createNotification({
        user: order.customer,
        title: "Order Delivered",
        message: "Your order has been delivered.",
        type: "order"
      });
    } else if (status === "Cancelled") {
      await createNotification({
        user: order.customer,
        title: "Order Cancelled",
        message: `Your order #${order.orderId} has been cancelled.`,
        type: "order"
      });
      await createNotification({
        isAdmin: true,
        title: "Order Cancelled",
        message: `Order #${order.orderId} has been cancelled.`,
        type: "order"
      });
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
