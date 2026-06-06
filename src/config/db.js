process.env.MONGOMS_DEBUG = "1";
const mongoose = require("mongoose");

let mongod = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    let dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rizerspace";
    const isAtlas = dbUri.startsWith("mongodb+srv://");

    let conn;
    if (isProduction || isAtlas) {
      // In production or when using Atlas, connect directly. No fallback allowed.
      console.log(isProduction ? "🌐 Connecting to MongoDB in Production..." : "☁️  Connecting to MongoDB Atlas...");
      conn = await mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      // In development (local non-Atlas), try local MongoDB first, fallback to memory-server
      console.log("📡 Attempting local MongoDB connection...");
      try {
        conn = await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
      } catch (err) {
        console.log("⚠️ Local MongoDB connection failed. Spinning up MongoDB Memory Server...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        mongod = await MongoMemoryServer.create({
          instance: { launchTimeout: 60000 }
        });
        dbUri = mongod.getUri();
        console.log(`🚀 MongoDB Memory Server running at: ${dbUri}`);
        conn = await mongoose.connect(dbUri);
        console.log("📡 Connected to MongoDB Memory Server");
      }
    }

    // Ensure admin user exists when configured via environment variables
    const User = require("../models/User");
    const Product = require("../models/Product");
    const count = await Product.countDocuments();

    // Auto-seed if database is empty ONLY when explicitly allowed
    if (count === 0) {
      if (process.env.ALLOW_AUTO_SEED === 'true') {
        console.log("🌱 Database is empty. Auto-seeding enabled — seeding demo data...");
        const { seedDB } = require("../seed/seedData");
        await seedDB(true); // true to skip connecting again
      } else {
        console.log("⚠️ Database is empty but auto-seed is disabled. To seed demo data run the seeder manually with SEED_DEMO=true.");
      }
    }

    // Ensure real admin account exists (runs AFTER seeding so seed can't wipe it)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!existingAdmin) {
        await User.create({
          name: process.env.ADMIN_NAME || "RizerSpace Admin",
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: "admin"
        });
        console.log(`✅ Admin account created: ${process.env.ADMIN_EMAIL}`);
      } else {
        console.log(`✅ Admin account already exists: ${existingAdmin.email}`);
      }
    }

  } catch (error) {
    console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Shutdown handler to clean up MongoMemoryServer
process.on("SIGINT", async () => {
  if (mongod) {
    console.log("🛑 Stopping MongoDB Memory Server...");
    await mongod.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
