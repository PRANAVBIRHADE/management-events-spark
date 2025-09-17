# Deployment Guide (Vercel + MongoDB Atlas + Resend)

## 1) Prerequisites
- GitHub repository with this code
- MongoDB Atlas cluster
- Resend account (for email)
- Custom domain (optional but recommended)

## 2) Required Environment Variables
Set these in Vercel → Project → Settings → Environment Variables.

- MONGODB_URI=your_mongodb_atlas_connection_string
- JWT_SECRET=64+ char random hex
- RESEND_API_KEY=your_resend_api_key
- EMAIL_FROM=MPGI SOE <noreply@yourdomain.com>
- NEXT_PUBLIC_BASE_URL=https://your-temp-vercel-url.vercel.app
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=supersecretpassword

Tips:
- Generate JWT secret locally:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

## 3) Deploy to Vercel
1. Import the GitHub repo in Vercel
2. Add env vars above
3. Deploy and note the generated URL (e.g., https://spark-events-xyz.vercel.app)

## 4) Add Custom Domain (optional)
1. Vercel → Project → Settings → Domains → Add `yourdomain.com`
2. Follow DNS instructions at your registrar (A/CNAME)
3. Wait until status becomes Active

## 5) Verify Domain in Resend
1. Resend → Domains → Add Domain → `yourdomain.com`
2. Add TXT/CNAME records at your registrar as instructed by Resend
3. Wait for status: Verified

## 6) Switch to Real Sender and URL
- Update Vercel envs:
  - EMAIL_FROM=MPGI SOE <noreply@yourdomain.com>
  - NEXT_PUBLIC_BASE_URL=https://yourdomain.com
- Redeploy

## 7) Production Test Plan
- Register new user → receive email → verify → login
- Admin login (`/admin-login`) → create event (free and paid)
- User registers for event → free: instant QR; paid: upload screenshot
- Admin: approve paid registration → ticket shows QR
- Download ticket PDF → open `/verify-ticket` and validate Ticket ID

## 8) Notes
- Cookies-based auth with middleware guards is enabled
- Rate limiting (60 req/min/IP) applies to `/api/*`
- Email sending: Resend (primary) with Nodemailer fallback
