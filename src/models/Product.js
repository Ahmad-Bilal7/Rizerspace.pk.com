const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, required: true }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  status: { type: String, enum: ["In-Stock", "Pre-Order", "Out-of-Stock"], default: "In-Stock" }
}, {
  timestamps: true
});

// Optimization Indexes
ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ status: 1 });

module.exports = mongoose.model("Product", ProductSchema);
