# 🚀 Nexora AI Production Deployment Guide

This guide details the steps to deploy Nexora AI to production.

---

## 🏗️ Architecture Overview

| Component | Recommended Host | Alternatives |
|---|---|---|
| **Frontend** (React + Vite) | **Vercel** | Netlify, Cloudflare Pages, Render Static |
| **Backend** (Node.js + Express + Socket.IO) | **Render** or **Railway** | Fly.io, AWS EC2, DigitalOcean |
| **Database** (PostgreSQL) | **Render Postgres** or **Neon / Supabase** | Railway Postgres, AWS RDS |

---

## 📋 Production Environment Variables Checklist

### 1. Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# URLs & CORS
CLIENT_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.onrender.com

# Security Secrets (Generate random 32+ char strings)
JWT_SECRET=super_secret_jwt_key_32_characters_long
JWT_REFRESH_SECRET=super_secret_refresh_key_32_characters_long
VAPI_WEBHOOK_SECRET=super_secret_webhook_key_32_chars

# AI & Voice Providers
GEMINI_API_KEY=your_gemini_api_key
VAPI_API_KEY=your_vapi_private_api_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 2. Frontend (`frontend/.env` or Vercel Environment Variables)

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_TRACKING_ENABLED=true
VITE_TRACKING_BATCH_INTERVAL_MS=5000
VITE_TRACKING_API_KEY=pk_track_demoapikeydemoapikeydemoapikey00
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VITE_DEMO_MODE=false
```

---

## 🚀 Option 1: Recommended Deployment (Vercel + Render)

### Step 1: Deploy Database & Backend on Render

1. Go to [Render.com](https://render.com) and create a **New PostgreSQL Database**:
   - Name: `nexora-ai-db`
   - Database: `sales_intelligence`
   - Copy the **Internal Database URL** (or External if hosting elsewhere).
2. Create a **New Web Service**:
   - Connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
3. Add the **Environment Variables** listed in the checklist above.
4. (Optional) Run database seed once after first deploy:
   - In Render Web Service Shell: `npx prisma db seed` or `node prisma/seed.js`
5. Note your backend URL: `https://your-backend.onrender.com`.

---

### Step 2: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the **Frontend Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
   - `VITE_TRACKING_ENABLED`: `true`
   - `VITE_TRACKING_API_KEY`: `pk_track_demoapikeydemoapikeydemoapikey00`
   - `VITE_VAPI_PUBLIC_KEY`: `your_vapi_public_key`
5. Click **Deploy**.

---

### Step 3: Update CORS on Backend

Once your Vercel frontend URL is live (e.g. `https://nexora-ai.vercel.app`):
1. Go back to Render backend settings.
2. Update `CLIENT_URL` to `https://nexora-ai.vercel.app`.
3. Update `ALLOWED_ORIGINS` to `https://nexora-ai.vercel.app`.
4. Click **Save Changes** (Render will redeploy with new CORS rules).

---

## 🐳 Option 2: 1-Click Render Blueprint (`render.yaml`)

1. Connect your repo to Render.
2. Click **New > Blueprint**.
3. Select this repo — Render will automatically detect `render.yaml` and provision:
   - PostgreSQL Database
   - Node.js Backend with automatic migrations
4. Supply the API keys when prompted.

---

## 🐋 Option 3: Docker / VPS Deployment

To run everything in production containers on any Ubuntu / Debian VPS:

```bash
# 1. Clone repository
git clone <your-repo-url> nexora-ai
cd nexora-ai

# 2. Configure .env
cp backend/.env.example .env
# edit .env with your real API keys

# 3. Start containers
docker-compose up -d --build

# 4. Run migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend node prisma/seed.js
```
