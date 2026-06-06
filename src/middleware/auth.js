const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "rizerspace_secret_key_1337");

      // Attach user to request, excluding password
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

// Admin role check middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
