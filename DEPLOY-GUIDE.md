# RizerSpace — Complete Deployment Guide
> Step-by-step instructions to take RizerSpace from local development to live production.

---

## 📋 What Remains Before You Go Live

| Task | Status | Section |
|------|--------|---------|
| Get a real Stripe account & live keys | ❌ Required | Step 2 |
| Create MongoDB Atlas cluster | ❌ Required | Step 3 |
| Create Cloudinary account | ❌ Required | Step 4 |
| Choose & set up a hosting server | ❌ Required | Step 5 |
| Set all production environment variables | ❌ Required | Step 6 |
| Build & deploy the frontend | ❌ Required | Step 7 |
| Deploy the backend API | ❌ Required | Step 8 |
| Point a domain name (optional) | ⚪ Optional | Step 9 |
| Final smoke test | ❌ Required | Step 10 |

---

## STEP 1 — Install Prerequisites (One Time)

Make sure these are installed on your machine:

```bash
# Check if Node.js is installed (needs v18+)
node -v

# Check if Git is installed
git -v

# Check npm
npm -v
```

If any are missing:
- **Node.js**: https://nodejs.org (download LTS version)
- **Git**: https://git-scm.com

---

## STEP 2 — Set Up Stripe (Card Payments)

1. Go to **https://stripe.com** → Create a free account
2. Verify your email and complete the setup wizard
3. In the Stripe Dashboard, click **Developers → API Keys**
4. Copy:
   - **Publishable key** → starts with `pk_test_` (for testing) or `pk_live_` (for production)
   - **Secret key** → starts with `sk_test_` (for testing) or `sk_live_` (for production)

> ⚠️ **Use test keys while testing. Only switch to `live_` keys when you are ready for real money.**

5. Configure the Stripe success/cancel redirect URLs:
   - Success URL: `https://yourdomain.com/orders/{ORDER_ID}?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`
   - Cancel URL: `https://yourdomain.com/checkout?cancelled=1`
   - These are already hardcoded in `orderController.js` using `FRONTEND_URL` env var — you only need to set that env var correctly.

---

## STEP 3 — Set Up MongoDB Atlas (Database)

1. Go to **https://cloud.mongodb.com** → Create a free account
2. Click **"Create a New Project"** → name it `rizerspace`
3. Click **"Create a Cluster"** → choose **M0 Free Tier** (sufficient for a small store)
4. Choose a region near your target users (e.g., Frankfurt for EU, Mumbai for South Asia)
5. Click **"Create Cluster"** and wait ~2 minutes

### Configure Access

6. Left sidebar → **Security → Database Access**
   - Click **"Add New Database User"**
   - Username: `rizerspace-prod`
   - Password: generate a strong password, **save it**
   - Role: **Read and Write to Any Database**
   - Click **Add User**

7. Left sidebar → **Security → Network Access**
   - Click **"Add IP Address"**
   - If your server has a fixed IP: enter that IP
   - If not: click **"Allow Access from Anywhere"** (`0.0.0.0/0`) — OK for small projects
   - Click **Confirm**

### Get the Connection String

8. Click **"Connect"** on your cluster → **"Connect your application"**
9. Copy the connection string, it looks like:
   ```
   mongodb+srv://rizerspace-prod:<PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Replace `<PASSWORD>` with the password you created in step 6
11. Add your database name before the `?`:
    ```
    mongodb+srv://rizerspace-prod:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rizerspace?retryWrites=true&w=majority
    ```
    This is your `MONGODB_URI`.

---

## STEP 4 — Set Up Cloudinary (Image Storage)

1. Go to **https://cloudinary.com** → Create a free account
2. Go to the **Dashboard**
3. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

These become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## STEP 5 — Choose a Hosting Platform

### Option A — Railway (Recommended, Easiest)
- Free tier available, great for student projects
- Deploys Node.js apps directly from GitHub
- URL: https://railway.app

### Option B — Render
- Free tier available (spins down when idle)
- URL: https://render.com

### Option C — VPS (DigitalOcean / Linode / Vultr)
- More control, ~$6/month
- Requires manual server setup

> This guide uses **Railway** (Option A) for simplicity.

---

## STEP 6 — Prepare Your Production `.env`

Create a new file (do NOT commit this to Git):

```env
# ── Server ────────────────────────────────────────
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com

# ── Database ──────────────────────────────────────
MONGODB_URI=mongodb+srv://rizerspace-prod:YOUR_ATLAS_PASSWORD@cluster0.xxxxx.mongodb.net/rizerspace?retryWrites=true&w=majority

# ── Security ──────────────────────────────────────
# Generate a new strong secret (run in terminal):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=PASTE_YOUR_64_CHAR_RANDOM_STRING_HERE

# ── Admin Account ─────────────────────────────────
ADMIN_NAME=RizerSpace Admin
ADMIN_EMAIL=rizerspace50@gmail.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# ── Stripe ────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...

# ── Manual Wallet Payments ────────────────────────
EASYPAISA_NUMBER=+92 345 1470780
JAZZCASH_NUMBER=+92 345 1470780

# ── Email (Brevo SMTP) ────────────────────────────
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=ahmadbilalkhan490@gmail.com
EMAIL_PASS=YOUR_BREVO_SMTP_KEY
EMAIL_FROM="RizerSpace <rizerspace50@gmail.com>"

# ── Cloudinary ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

# ── DO NOT set these in production ────────────────
# ALLOW_AUTO_SEED=true    ← REMOVE or leave unset
# SEED_DEMO=true          ← REMOVE or leave unset
```

> ⚠️ **Generate a new `JWT_SECRET` for production.** Run this in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## STEP 7 — Build the Frontend

### If deploying frontend separately (Netlify / Vercel)

1. Go to **https://vercel.com** or **https://netlify.com** → Create account
2. Connect your GitHub repository
3. Set these build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
5. Click **Deploy**

> Your frontend URL (e.g. `https://rizerspace.vercel.app`) becomes the `FRONTEND_URL` in your backend env.

### Update frontend API base URL

Open `d:\Rizerspace\frontend\src\services\api.js` and verify it reads from env:

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
```

If it's hardcoded to `localhost`, update it to use the env var above.

---

## STEP 8 — Deploy the Backend to Railway

### 8.1 Push Code to GitHub

```bash
# In your project root (d:\Rizerspace)
git init                          # skip if already a git repo
git add .
git commit -m "feat: production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rizerspace.git
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` — it should already be.

### 8.2 Deploy to Railway

1. Go to **https://railway.app** → Sign In with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `rizerspace` repository
4. Railway will auto-detect Node.js and start deploying

### 8.3 Add Environment Variables in Railway

1. In your Railway project → click your service → **"Variables"** tab
2. Click **"Raw Editor"** and paste ALL of your production `.env` contents from Step 6
3. Click **"Update Variables"** — Railway will redeploy automatically

### 8.4 Set the Start Command

Railway should auto-detect `npm start` from `package.json`. If not:
- Go to **Settings → Deploy** → set **Start Command** to: `node src/index.js`

### 8.5 Get Your Backend URL

- Railway gives you a URL like: `https://rizerspace-production.up.railway.app`
- This is your backend URL
- Update `FRONTEND_URL` in Railway variables to your Vercel frontend URL
- Update `VITE_API_URL` in Vercel to `https://rizerspace-production.up.railway.app/api`

---

## STEP 9 — Custom Domain (Optional)

### For Frontend (Vercel)
1. Vercel Dashboard → your project → **Domains**
2. Add your domain (e.g. `rizerspace.pk`)
3. Copy the DNS record Vercel gives you
4. Go to your domain registrar → DNS settings → add the record
5. Wait up to 24 hours for DNS to propagate

### For Backend (Railway)
1. Railway Dashboard → your service → **Settings → Networking**
2. Click **"Generate Domain"** or add your custom backend domain

---

## STEP 10 — Final Smoke Test

After deployment, test these flows in order:

### ✅ Basic Site
- [ ] Home page loads with products
- [ ] Catalog page works with filters
- [ ] Product detail page shows images and reviews

### ✅ Auth
- [ ] Register a new account
- [ ] Login with that account
- [ ] Logout and login again

### ✅ Cart & Checkout
- [ ] Add a product to cart
- [ ] Go to Checkout
- [ ] Fill in contact + address
- [ ] Place a **COD order** → redirected to order tracking
- [ ] Order status shows `Confirmed`

### ✅ Payment — JazzCash / EasyPaisa
- [ ] Place an order with JazzCash
- [ ] See the payment reference screen with wallet number `+92 345 1470780`
- [ ] Admin verifies payment in Admin → Orders → "Verify Payment" button
- [ ] Customer sees payment status change to `Paid`

### ✅ Payment — Stripe
- [ ] Place an order with Credit/Debit Card
- [ ] Redirected to Stripe checkout page
- [ ] Use Stripe test card: `4242 4242 4242 4242` / any future date / any CVC
- [ ] Redirected back to order tracking with `Payment: Paid`

### ✅ Order Management
- [ ] Cancel a Pending order → stock restored
- [ ] Admin changes order status from Confirmed → Shipped
- [ ] Customer receives notification in the bell icon

### ✅ Reviews
- [ ] Customer with a Delivered order can submit a review
- [ ] Customer WITHOUT a Delivered order sees "verified buyers only" message
- [ ] Admin can delete any review

### ✅ Admin Panel
- [ ] Login as admin → Admin Panel appears in user menu
- [ ] Admin → Products: add/edit/delete product with image upload
- [ ] Admin → Orders: filter by status + payment, update status
- [ ] Admin → Coupons: create a discount coupon, test it at checkout

### ✅ Mobile
- [ ] Open site on phone or use DevTools mobile view
- [ ] Navbar hamburger menu works
- [ ] Checkout form stacks correctly on small screen
- [ ] Order tracking page stacks correctly on small screen

---

## 🚨 Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `CORS error` on API calls | `FRONTEND_URL` env var is wrong | Set exact frontend URL in backend env, no trailing slash |
| `MongoDB connection error` | Wrong Atlas URI or IP not whitelisted | Double-check connection string, add `0.0.0.0/0` to Network Access |
| `Stripe session failed` | Wrong `STRIPE_SECRET_KEY` | Check key starts with `sk_test_` or `sk_live_` |
| Products/orders not loading | Frontend `VITE_API_URL` not set | Add env var to Vercel/Netlify pointing to backend URL |
| Admin account not created | `ADMIN_EMAIL` env var not set | Add admin env vars to Railway variables |
| Images not uploading | Cloudinary credentials wrong | Verify all three Cloudinary env vars |
| Build fails on Vercel | Missing env var during build | Add `VITE_API_URL` to Vercel build environment |

---

## 📁 Project Structure Summary

```
rizerspace/
├── src/                      ← Backend (Node.js / Express)
│   ├── config/db.js          ← MongoDB connection (production safe)
│   ├── controllers/          ← Business logic
│   ├── models/               ← Mongoose schemas
│   ├── routes/               ← API route definitions
│   ├── middleware/           ← Auth, rate limit, sanitize
│   ├── services/             ← Email, Cloudinary
│   ├── utils/                ← Notification helper
│   └── index.js              ← Server entry point
├── frontend/                 ← Frontend (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── pages/            ← All page components
│   │   ├── components/       ← Shared UI components
│   │   ├── store/            ← Redux state (auth, cart)
│   │   ├── services/api.js   ← Axios API client
│   │   └── index.css         ← Global styles
│   └── dist/                 ← Built frontend (after npm run build)
├── .env                      ← Local dev environment (never commit)
├── .env.example              ← Template for env vars
├── package.json              ← Backend scripts & dependencies
└── DEPLOY-GUIDE.md           ← This file
```

---

## 💰 Estimated Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway (backend) | 500 hrs/month free | $5/month after |
| Vercel (frontend) | Unlimited free for personal | Free |
| MongoDB Atlas | 512MB free (M0) | $57/month (M10) |
| Cloudinary | 25GB storage free | $89/month |
| Stripe | Free (takes 2.9% + $0.30 per transaction) | N/A |

> For a student/portfolio project, **everything can run on free tiers.**

---

*Generated: June 2026 — RizerSpace v1.0*
