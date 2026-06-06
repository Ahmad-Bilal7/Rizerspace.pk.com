const Notification = require("../models/Notification");

// @desc    Get logged-in user or admin notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "admin") {
      // Admins see notifications targetted to them OR admin-wide notifications
      query = {
        $or: [
          { isAdmin: true },
          { user: req.user._id }
        ]
      };
    } else {
      // Normal customers see their own notifications
      query = { user: req.user._id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Cap at latest 50 notifications

    res.json({ data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Verify ownership: must be matching user, or if admin notification, req.user must be an admin
    const isOwner = notification.user && notification.user.toString() === req.user._id.toString();
    const isAdminNotificationForAdmin = notification.isAdmin && req.user.role === "admin";

    if (!isOwner && !isAdminNotificationForAdmin) {
      return res.status(403).json({ error: "Not authorized to read this notification" });
    }

    notification.read = true;
    await notification.save();

    res.json({ data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
