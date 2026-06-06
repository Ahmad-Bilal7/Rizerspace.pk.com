require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Review = require("../models/Review");

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rizerspace";
  const isAtlas = dbUri.startsWith("mongodb+srv://");

  if (isProduction || isAtlas) {
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
    console.log("📡 Connected to MongoDB...");
  } else {
    try {
      await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      console.log("📡 Connected to Local MongoDB...");
    } catch (err) {
      console.log("⚠️ Local MongoDB failed. Seeding into MongoMemoryServer...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log("📡 Connected to MongoMemoryServer...");
    }
  }
};

const productsData = [
  {
    title: "Goku Ultra Instinct",
    description: "Premium 1/6 scale masterpiece of Goku in his Ultra Instinct form. Features 30+ articulation points, energy effect parts, and interchangeable hands.",
    category: "Scale Figures",
    price: 89.99, discountedPrice: 74.99, stock: 25,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Naruto Uzumaki — Sage Mode",
    description: "Naruto in his iconic Sage Mode stance. Includes Rasengan effect part and display base with Hidden Leaf Village crest.",
    category: "Scale Figures", price: 79.99, stock: 18,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Monkey D. Luffy — Gear 5",
    description: "Luffy in his legendary Gear 5 transformation. Joyboy's power in a stunning 1/6 scale figure with cloud effect accessories and alternate heads.",
    category: "Statues", price: 94.99, stock: 12,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Tanjiro Kamado",
    description: "Tanjiro wielding his Nichirin blade. Features stunning translucent dark red breathing effect parts.",
    category: "Nendoroids", price: 84.99, discountedPrice: 69.99, stock: 30,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Levi Ackerman",
    description: "Humanity's Strongest Soldier in full ODM gear. Includes multiple blades and a dynamic flying pose display stand.",
    category: "Scale Figures", price: 92.99, stock: 8,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Satoru Gojo",
    description: "The strongest sorcerer in his blindfold-off stance. Limitless cursed technique energy effects included.",
    category: "Nendoroids", price: 88.99, stock: 0,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    averageRating: 0, numReviews: 0, status: "Out-of-Stock"
  },
  {
    title: "All Might — Silver Age",
    description: "The Symbol of Peace in his prime. All Might's iconic Plus Ultra pose with Golden Age hero suit.",
    category: "Statues", price: 76.99, discountedPrice: 64.99, stock: 20,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Itachi Uchiha",
    description: "Itachi with Sharingan activated. Akatsuki cloak, kunai accessories, and Susanoo rib cage display effect.",
    category: "Statues", price: 91.99, stock: 14,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Ichigo Kurosaki — Bankai",
    description: "Ichigo in his final Bankai form. Includes Zangetsu, spiritual pressure effect parts, and a hollow mask accessory.",
    category: "Scale Figures", price: 86.99, stock: 16,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Saitama — Serious Punch",
    description: "Saitama mid Serious Punch. Shockwave effect base included. Beautifully sculpted expression of pure, effortless power.",
    category: "Accessories", price: 74.99, discountedPrice: 59.99, stock: 22,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Zoro — Three Sword Style",
    description: "Roronoa Zoro in his iconic three-sword style stance. Hell's memory pose with translucent red effect parts.",
    category: "Statues", price: 97.99, stock: 10,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  },
  {
    title: "Mikasa Ackerman",
    description: "Mikasa in combat stance with ODM gear. Features multiple blade accessories and flowing scarf detail.",
    category: "Scale Figures", price: 82.99, stock: 11,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    averageRating: 0, numReviews: 0, status: "In-Stock"
  }
];

const coupons = [
  { code: "RIZERSPACE10", discount: 10, expiryDate: new Date("2027-12-31"), isActive: true },
  { code: "ANIME20",      discount: 20, expiryDate: new Date("2027-06-30"), isActive: true },
  { code: "NEWUSER15",    discount: 15, expiryDate: new Date("2027-12-31"), isActive: true }
];

const seedDB = async (skipConnect = false) => {
  if (process.env.SEED_DEMO !== 'true' && process.env.FORCE_SEED !== 'true') {
    console.log('⚠️ Seeding skipped: set SEED_DEMO=true to seed demo data.');
    return;
  }
  try {
    if (!skipConnect) await connectDB();

    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    const Notification = require("../models/Notification");
    await Notification.deleteMany({});

    console.log("🧹 Cleared existing data");

    // Insert Products
    const seededProducts = await Product.insertMany(productsData);
    console.log(`✅ Seeded ${seededProducts.length} products`);

    // Create seed demo admin
    const admin = await User.create({
      name: "RizerSpace Admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@rizerspace.com",
      password: process.env.SEED_ADMIN_PASSWORD || "changeMe123!",
      role: "admin"
    });
    console.log(`✅ Seed admin created: ${admin.email}`);

    // Also ensure the real production admin from ADMIN_EMAIL always exists
    if (
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_EMAIL !== admin.email
    ) {
      await User.create({
        name: process.env.ADMIN_NAME || "RizerSpace Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin"
      });
      console.log(`✅ Production admin created: ${process.env.ADMIN_EMAIL}`);
    }

    // Create 3 Customers
    const customer1 = await User.create({
      name: "Sample Customer",
      email: process.env.SEED_CUSTOMER_EMAIL || "sample@customer.local",
      password: process.env.SEED_CUSTOMER_PASSWORD || "changeMe123!",
      role: "customer",
      isVerified: true
    });

    const customer2 = await User.create({
      name: "John Doe",
      email: "john@customer.local",
      password: "changeMe123!",
      role: "customer",
      isVerified: true
    });

    const customer3 = await User.create({
      name: "Jane Smith",
      email: "jane@customer.local",
      password: "changeMe123!",
      role: "customer",
      isVerified: true
    });
    console.log("✅ Seeded 3 customer accounts");

    // Seed Coupons
    await Coupon.insertMany(coupons);
    console.log(`✅ Seeded ${coupons.length} coupons`);

    // Helper to find seeded products by title
    const getProduct = (title) => seededProducts.find(p => p.title === title);

    const pGoku = getProduct("Goku Ultra Instinct");
    const pNaruto = getProduct("Naruto Uzumaki — Sage Mode");
    const pLuffy = getProduct("Monkey D. Luffy — Gear 5");
    const pTanjiro = getProduct("Tanjiro Kamado");

    // Seed Delivered Orders (establishing verified buyer status)
    console.log("📦 Seeding delivered orders for review eligibility...");
    
    // Order 1: John Doe bought Goku and Naruto
    const order1 = await Order.create({
      orderId: `RZ-SEED-01`,
      customer: customer2._id,
      items: [
        { product: pGoku._id, name: pGoku.title, image: pGoku.images[0], quantity: 1, price: pGoku.price },
        { product: pNaruto._id, name: pNaruto.title, image: pNaruto.images[0], quantity: 1, price: pNaruto.price }
      ],
      contactName: customer2.name,
      contactEmail: customer2.email,
      contactPhone: "+92 300 9876543",
      shippingAddress: "Street 5, Sector G-11, Islamabad, Pakistan",
      paymentMethod: "COD",
      paymentStatus: "Paid",
      totalAmount: pGoku.price + pNaruto.price,
      orderStatus: "Delivered"
    });

    // Order 2: Jane Smith bought Naruto and Luffy
    const order2 = await Order.create({
      orderId: `RZ-SEED-02`,
      customer: customer3._id,
      items: [
        { product: pNaruto._id, name: pNaruto.title, image: pNaruto.images[0], quantity: 1, price: pNaruto.price },
        { product: pLuffy._id, name: pLuffy.title, image: pLuffy.images[0], quantity: 1, price: pLuffy.price }
      ],
      contactName: customer3.name,
      contactEmail: customer3.email,
      contactPhone: "+92 300 1122334",
      shippingAddress: "Phase 4, DHA, Lahore, Pakistan",
      paymentMethod: "Stripe",
      paymentStatus: "Paid",
      totalAmount: pNaruto.price + pLuffy.price,
      orderStatus: "Delivered"
    });

    // Order 3: Sample Customer bought Goku and Tanjiro
    const order3 = await Order.create({
      orderId: `RZ-SEED-03`,
      customer: customer1._id,
      items: [
        { product: pGoku._id, name: pGoku.title, image: pGoku.images[0], quantity: 1, price: pGoku.price },
        { product: pTanjiro._id, name: pTanjiro.title, image: pTanjiro.images[0], quantity: 1, price: pTanjiro.price }
      ],
      contactName: customer1.name,
      contactEmail: customer1.email,
      contactPhone: "+92 345 1470780",
      shippingAddress: "House 12, Street 3, F-7, Islamabad, Pakistan",
      paymentMethod: "EasyPaisa",
      paymentStatus: "Paid",
      totalAmount: pGoku.price + pTanjiro.price,
      orderStatus: "Delivered"
    });

    console.log("✅ Seeded delivered orders");

    // Seed Reviews using Review.create() so rating hooks run automatically
    console.log("✍️  Seeding product reviews...");

    // Review 1
    await Review.create({
      user: customer2._id,
      product: pGoku._id,
      rating: 5,
      comment: "Excellent quality and packaging. Arrived exactly as shown."
    });

    // Review 2
    await Review.create({
      user: customer1._id,
      product: pGoku._id,
      rating: 5,
      comment: "One of the best anime figures I own. Highly recommended."
    });

    // Review 3
    await Review.create({
      user: customer3._id,
      product: pNaruto._id,
      rating: 4,
      comment: "Good detail and paint quality. Shipping took a little longer."
    });

    // Review 4
    await Review.create({
      user: customer2._id,
      product: pNaruto._id,
      rating: 5,
      comment: "Great value for the price. Will order again."
    });

    // Review 5 (Luffy Review)
    await Review.create({
      user: customer3._id,
      product: pLuffy._id,
      rating: 5,
      comment: "Luffy Gear 5 figure is absolutely stunning! Details are perfect."
    });

    // Review 6 (Tanjiro Review)
    await Review.create({
      user: customer1._id,
      product: pTanjiro._id,
      rating: 4,
      comment: "Great paint job and poses. The shipping box was slightly bent though."
    });

    console.log("✅ Seeded reviews and recalculated average ratings");
    console.log("\n⚡ Database seeding complete! RizerSpace is ready.\n");
  } catch (error) {
    console.error("🚨 Seeding Error:", error);
    if (!skipConnect) process.exit(1);
  }
};

module.exports = { seedDB, products: productsData, coupons };

if (require.main === module) {
  (async () => {
    await seedDB(false);
    process.exit(0);
  })();
}
