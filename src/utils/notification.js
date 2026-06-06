const Notification = require("../models/Notification");

/**
 * Creates a database notification for a user or admin.
 * @param {Object} params
 * @param {string} [params.user] - The target user ID (optional)
 * @param {boolean} [params.isAdmin] - Whether this notification is for admins (default: false)
 * @param {string} params.title - The notification title
 * @param {string} params.message - The notification message
 * @param {string} [params.type] - The type of notification: order | payment | system
 */
const createNotification = async ({ user, isAdmin = false, title, message, type = "system" }) => {
  try {
    await Notification.create({
      user: user || null,
      isAdmin,
      title,
      message,
      type
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

module.exports = { createNotification };
