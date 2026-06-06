const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validation/schemas");
const { registerUser, loginUser, getProfile, updateProfile, changePassword } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/auth");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
