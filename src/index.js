require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const { apiLimiter } = require("./middleware/rateLimiter");
const sanitizeInput = require("./middleware/sanitize");

// ── Connect Database ────────────────────────────────────────────────────────
// Trigger restart to load new environment variables from .env file
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security & Performance Middleware ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "https:", "blob:"],
      connectSrc:     ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false // allow cross-origin images
}));
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// ── XSS / HTML Sanitizer ────────────────────────────────────────────────────
app.use(sanitizeInput);

// ── Global Rate Limiter ─────────────────────────────────────────────────────
app.use("/api/", apiLimiter);

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",              require("./routes/authRoutes"));
app.use("/api/products",          require("./routes/productRoutes"));
app.use("/api/orders",            require("./routes/orderRoutes"));
app.use("/api/reviews",           require("./routes/reviewRoutes"));
app.use("/api/coupons",           require("./routes/couponRoutes"));
app.use("/api/notifications",     require("./routes/notificationRoutes"));


// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "RizerSpace API", timestamp: new Date() });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 RizerSpace API running → http://localhost:${PORT}`);
  console.log(`📡 Health check → http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
