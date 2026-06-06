# Deployment Guide — RizerSpace

This file explains how to prepare and publish the project (frontend + backend).

Prerequisites
- Node.js (18+ recommended)
- An external MongoDB (MongoDB Atlas) for production
- Accounts: Vercel (frontend), Render / Heroku / DigitalOcean App Platform (backend) — or a single fullstack host

1) Environment
- Copy `.env.example` to `.env` and set production values.
- Ensure `JWT_SECRET` is a long random string and `MONGODB_URI` points to your production database.
- Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` so the backend can create an admin account automatically if none exists.
- Keep `SEED_DEMO=false` and `ALLOW_AUTO_SEED=false` on production.

2) Local smoke test
```powershell
npm install
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

3) Build frontend
```powershell
# From repo root
npm run build:frontend
# Output: frontend/dist
```

4) Seeding (manual & opt-in)
- Only run the seeder if you want demo data in a non-production environment.
PowerShell example:
```powershell
$env:SEED_DEMO = "true"
$env:SEED_ADMIN_EMAIL = "admin@example.com"
$env:SEED_ADMIN_PASSWORD = "StrongPass1!"
node src/seed/seedData.js
```

5) Recommended publish configuration
- Frontend: Vercel (connect repo, set Root to `/frontend`, Build: `npm run build`, Output: `dist`).
- Backend: Render (or Heroku) — set start command `npm start` and environment variables as in `.env`.

6) Production checklist
- `NODE_ENV=production`
- `ALLOW_AUTO_SEED=false`
- Set `FRONTEND_URL` to the deployed frontend URL in backend env.
- Configure `CLOUDINARY_*` and `EMAIL_*` if using uploads or transactional emails.
- Confirm that demo UI is hidden and no test credentials are exposed.

7) CI (optional)
- Add a CI pipeline to build the frontend and run backend lint/tests on push; see `.github/workflows/ci.yml` in this repo.

If you want, I can add Render / Vercel specific screenshots and example environment values.
