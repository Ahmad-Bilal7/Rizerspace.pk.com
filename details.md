# 🚀 RizerSpace — Project Details & Documentation

**RizerSpace** is a production-ready, full-stack anime collectible e-commerce platform. Features a Node.js/Express REST API backend with MongoDB persistence, a React 19/Vite frontend with a **BLACK & RED** glassmorphic design, JWT authentication with rotating refresh tokens, and Redux state management.

---

## 🏗️ Architecture & Project Structure

```
Rizerspace/
├── src/                          # Backend (Node.js / Express)
│   ├── index.js                  # Express server entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Verify Email, Reset Password, Refresh/Logout
│   │   ├── couponController.js   # Coupon verify, create, delete
│   │   ├── orderController.js    # Order placement, status, cancellation
│   │   ├── productController.js  # Product CRUD, search & pagination
│   │   └── reviewController.js   # Product reviews & rating recalculations
│   ├── middleware/
│   │   ├── auth.js               # JWT protect & admin guard middleware
│   │   ├── error.js              # Global centralized error handler
│   │   ├── rateLimiter.js        # IP rate limiter for auth/API endpoints
│   │   ├── sanitize.js           # XSS / HTML input sanitizer
│   │   ├── upload.js             # Multer-based image upload middleware
│   │   └── validate.js           # Zod-based request schema validator
│   ├── models/
│   │   ├── Coupon.js             # Coupon schema (code, discount, expiry)
│   │   ├── Order.js              # Order schema (products, payment, shipping)
│   │   ├── Product.js            # Product schema with specs & rarity
│   │   ├── Review.js             # Product reviews with avg rating hook
│   │   └── User.js               # User schema (roles, points, badges)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── reviewRoutes.js
│   ├── seed/
│   │   └── seedData.js           # Dev data seeder (products, admin, customer)
│   ├── services/
│   │   └── emailService.js       # Transactional email templates (Nodemailer)
│   ├── utils/
│   │   └── cloudinary.js         # Cloudinary image hosting utility
│   └── validation/
│       └── schemas.js            # Zod request validation schemas
│
├── frontend/                     # React 19 SPA (Vite)
│   └── src/
│       ├── App.css               # Global base styles
│       ├── App.jsx               # Client routes, lazy loading, protected routes
│       ├── main.jsx              # Vite entrypoint with Redux/React Router providers
│       ├── index.css             # Tailwind custom variables & BLACK/RED design tokens
│       ├── components/
│       │   ├── AdminNav.jsx      # Admin panel sub-navigation tabs
│       │   ├── AdminRoute.jsx    # Route guard (admin role only)
│       │   ├── Footer.jsx
│       │   ├── GlassCard.jsx     # Reusable glassmorphic card
│       │   ├── Navbar.jsx        # Sticky nav with cart/wishlist/user menu
│       │   ├── ProductCard.jsx   # Grid card with rating badges & hover scale
│       │   ├── ProtectedRoute.jsx# Route guard (authenticated users)
│       │   ├── ReviewSection.jsx # Tabbed review forum with star ratings
│       │   └── ScrollToTop.jsx   # Scroll restore on page-change
│       ├── pages/
│       │   ├── Cart.jsx          # Shopping cart with coupon application
│       │   ├── Catalog.jsx       # Full product grid with filters & search
│       │   ├── Checkout.jsx      # Checkout form & order confirmation
│       │   ├── Home.jsx          # Hero, featured products, categories
│       │   ├── Login.jsx         # JWT login form
│       │   ├── OrderHistory.jsx  # Customer order history list
│       │   ├── OrderTracking.jsx # Individual order status & progress bar
│       │   ├── ProductDetails.jsx# Specs, reviews, recommendations
│       │   ├── Profile.jsx       # User profile & order overview
│       │   ├── Register.jsx      # Registration with email verification
│       │   └── admin/
│       │       ├── Coupons.jsx   # Promo code campaign manager
│       │       ├── Orders.jsx    # Order fulfillment & status management
│       │       └── Products.jsx  # Catalog CRUD (create/edit/delete figures)
│       ├── store/
│       │   ├── index.js          # Redux store root
│       │   ├── authSlice.js      # Auth state (user, token, localStorage)
│       │   ├── cartSlice.js      # Cart state (items, quantities, totals)
│       │   ├── currencySlice.js  # Active currency & exchange rate
│       │   └── wishlistSlice.js  # Wishlist state
│       ├── services/
│       │   └── api.js            # Axios instance with rotating JWT interceptor
│       └── utils/
│           └── toast.js          # Shared toast notification utility
│
├── .env                          # Environment variables (see below)
├── package.json                  # Backend scripts & dependencies
└── details.md                    # This file
```

---

## ⚡ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | HTTP REST server, routing, and controller architecture |
| **MongoDB + Mongoose** | Persistent data storage with schemas and indexing |
| **JSON Web Tokens (JWT)** | Secure stateless auth with Refresh Token Rotation (RTR) |
| **bcryptjs** | Secure password hashing |
| **Helmet + Rate Limiter** | Security headers, CSRF defense, and brute-force protection |
| **Zod** | Rigid request schema validation middleware |
| **Multer + Cloudinary** | Multipart image upload and cloud-based file hosting |
| **Nodemailer** | Transactional email delivery (verification, password reset) |
| **Stripe** | Payment processing integration |
| **compression** | HTTP response compression |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | Component-based modern UI with fast Hot Module Replacement |
| **Tailwind CSS** | Utility-first styling with black/red glassmorphism design tokens |
| **Redux Toolkit** | Cart, wishlist, auth, and currency global state management |
| **TanStack Query v5** | Declarative caching, server state mutations, and data refetching |
| **Framer Motion** | Entrance animations, page transitions, and card effects |
| **React Router v7** | Client-side routing with nested protected/admin guards |
| **Axios** | HTTP client with automatic token refresh interceptor |
| **react-hot-toast** | Toast notification system |
| **Lucide React** | Sleek icon system |

---

## 🎨 Color Palette

The site uses **EXCLUSIVELY** black, red, and gray tones:

| Color | Hex | Usage |
|---|---|---|
| **Black** | #000000 / #111111 | Primary backgrounds |
| **Dark Gray** | #1F1F1F / #374151 | Borders, secondary elements |
| **Red** | #DC2626 / #EF4444 | Primary accent, buttons, highlights |
| **Dark Red** | #7F1D1D / #991B1B | Secondary accents, gradients |
| **White** | #FFFFFF | Primary text |
| **Light Gray** | #D1D5DB / #9CA3AF | Muted text, disabled states |

---

## 🔐 Auth Flow

1. **Register** → Account created, verification email sent (token printed to console in development).
2. **Verify Email** → `POST /auth/verify-email` with `{ token }`. Server SHA-256-hashes the token to match database storage.
3. **Login** → Returns a short-lived Access Token in JSON (`15m` expiry) and sets a secure HttpOnly `sameSite: "strict"` cookie with a Refresh Token (`7d` expiry).
4. **Refresh Token Rotation (RTR)** → On access token expiry, the client exchanges the refresh token for a new one. Old token is revoked.
5. **Compromise Detection** → A reused/stolen refresh token triggers immediate revocation of **all** active sessions.
6. **Forgot / Reset Password** → Ephemeral SHA-256 hashed reset token, valid for 10 minutes.

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api`

### Auth Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create new account |
| `POST` | `/auth/login` | Public | Login, set HttpOnly cookie, return access token |
| `POST` | `/auth/verify-email` | Public | Verify user email with `{ token }` |
| `POST` | `/auth/forgot-password` | Public | Request a secure password reset link |
| `POST` | `/auth/reset-password` | Public | Reset password with `{ token, password }` |
| `POST` | `/auth/refresh-token` | Public | Rotate refresh token and get a new access token |
| `POST` | `/auth/logout` | Public | Clear session & cookie |

### Product Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | List products (`?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?rating=`, `?sort=`, `?page=`, `?limit=`) |
| `GET` | `/products/:id` | Public | Get single product detail with specs |
| `POST` | `/products` | Admin | Create product (multipart with image uploads) |
| `PUT` | `/products/:id` | Admin | Update product metadata |
| `DELETE` | `/products/:id` | Admin | Delete product from catalog |

### Order Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Private | Place a new order with cart items and address |
| `GET` | `/orders/myorders` | Private | Get customer's own order history |
| `GET` | `/orders/:id` | Private | Get single order details with tracking |
| `PUT` | `/orders/:id/cancel` | Private | Customer cancellation request |
| `GET` | `/orders` | Admin | List all platform orders |
| `PUT` | `/orders/:id/status` | Admin | Update fulfillment status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) |

### Review Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/reviews` | Private | Submit a product review (rating `1–5` + comment) |
| `GET` | `/reviews/product/:productId` | Public | Get all reviews for a product |
| `DELETE` | `/reviews/:id` | Private/Owner/Admin | Delete review (auto-updates product avg rating) |

### Coupon Routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/coupons/verify` | Private | Verify coupon code (returns discount & expiry) |
| `GET` | `/coupons` | Admin | List all promotional coupons |
| `POST` | `/coupons` | Admin | Create new coupon |
| `DELETE` | `/coupons/:id` | Admin | Delete coupon |

---

## ⚙️ Environment Variables (`.env`)

```env
# Server
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/rizerspace
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Security
JWT_SECRET=replace_with_a_strong_random_secret

# Admin setup (auto-created on startup if no admin exists)
ADMIN_NAME=RizerSpace Admin
ADMIN_EMAIL=admin@rizerspace.com
ADMIN_PASSWORD=changeMe123!

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional, for production email sending)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=supersecret
EMAIL_FROM="RizerSpace <no-reply@example.com>"

# Seeding (opt-in)
SEED_DEMO=false
ALLOW_AUTO_SEED=false

# Demo seed credential overrides (used when SEED_DEMO=true)
SEED_ADMIN_EMAIL=admin@rizerspace.com
SEED_ADMIN_PASSWORD=changeMe123!
SEED_CUSTOMER_EMAIL=sample@customer.local
SEED_CUSTOMER_PASSWORD=changeMe123!
```

---

## 🚀 Running the Project

### 1. Backend
```bash
npm install
npm run dev          # Starts Express on http://localhost:4000
```

### 2. Seed Database
```bash
npm run seed
```
This populates the database with:
- **Admin** account (credentials from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- **Sample customer** account (credentials from `SEED_CUSTOMER_EMAIL` / `SEED_CUSTOMER_PASSWORD`)
- **Sample products** with specs, rarity, and category data
- **3 coupons:** `RIZERSPACE10` (10% off), `ANIME20` (20% off), `NEWUSER15` (15% off)

### 3. Frontend
```bash
cd frontend
npm install
npm run dev          # Starts Vite dev server on http://localhost:5173
```

### 4. Run Both Concurrently (from root)
```bash
npm run dev          # Starts backend (port 4000) + frontend (port 5173)
```

---

## 🛡️ Admin Panel

Access at `/admin` using the admin account.

| Panel | Route | Description |
|---|---|---|
| **Products Management** | `/admin/products` | CRUD for catalog — create, edit, delete figures with image handling |
| **Fulfillment Control** | `/admin/orders` | Manage customer order statuses, addresses, and line-item fulfillments |
| **Coupons Manager** | `/admin/coupons` | Create, monitor, and delete promotional discount codes |

---

*Last updated: June 4, 2026*
