const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [OrderItemSchema],

  // Flat contact + address string — simple, no sub-schema overhead
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true }, // e.g. "House 5, Street 3, F-7/2, Islamabad, Pakistan"

  paymentMethod: {
    type: String,
    enum: ["Stripe", "JazzCash", "EasyPaisa", "COD"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },

  // Reference code shown to customer for manual wallet payments (RZ-PAY-xxxx)
  paymentReference: { type: String },
  // TXN ID submitted by customer after manual wallet transfer
  transactionId: { type: String },
  // Stripe Checkout Session ID for card payment confirmation
  stripeSessionId: { type: String },

  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  orderStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  }
}, {
  timestamps: true
});

OrderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
