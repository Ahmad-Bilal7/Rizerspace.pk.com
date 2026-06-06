const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["order", "payment", "system"],
    default: "system"
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ isAdmin: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
