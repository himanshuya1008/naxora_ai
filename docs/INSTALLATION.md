# Installation Guide

Step-by-step setup for Nexora AI.

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 20.x | `node -v` |
| npm | >= 10.x | ships with Node 20 |
| PostgreSQL database | — | use a free [Neon](https://neon.tech) project, or local Postgres for dev |
| Google Gemini API key | — | [ai.google.dev](https://ai.google.dev) — conversation brain + report generation |
| Vapi account | — | [vapi.ai](https://vapi.ai) — voice call orchestration (private key, public key, and an Assistant ID) |

A publicly reachable URL for your backend (e.g. an `ngrok` tunnel in local dev) is required for Vapi's end-of-call webhook to reach you.

## 2. Clone & Install

```bash
git clone <your-repo-url> ai-sales-intelligence-platform
cd ai-sales-intelligence-platform
npm install
```

This installs dependencies for the root, `frontend/`, and `backend/` workspaces in one pass (npm workspaces).

## 3. Configure Environment Variables

### Backend

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

- `DATABASE_URL` — your Neon (or local Postgres) connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`
- `GEMINI_API_KEY`
- `VAPI_API_KEY` (private), `VAPI_PUBLIC_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_WEBHOOK_SECRET` (generate with `openssl rand -hex 32`)
- `ALLOWED_ORIGINS` — include `http://localhost:5173` for local dev

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Fill in `frontend/.env`:

- `VITE_API_BASE_URL` — `http://localhost:5000/api` for local dev
- `VITE_VAPI_PUBLIC_KEY` — same Vapi public key as the backend's `VAPI_PUBLIC_KEY`

## 4. Set Up the Database

With `DATABASE_URL` configured in `backend/.env`:

```bash
npm run prisma:generate
npm run prisma:migrate
```

`prisma:migrate` will prompt for a migration name on first run (e.g. `init`) and apply the schema to your database.

Optional — inspect data visually:

```bash
npm run prisma:studio
```

## 5. Run the App

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Backend health check: http://localhost:5000/api/health

To run each side independently:

```bash
npm run dev:frontend
npm run dev:backend
```

## 6. Verify Voice Pipeline (Optional but Recommended)

1. Expose your backend publicly (e.g. `ngrok http 5000`) and set `VAPI_WEBHOOK_BASE_URL`, then run `npm run vapi:configure --workspace=backend` to point your Vapi Assistant at the webhook.
2. Open the dashboard, navigate to the AI Conversation page.
3. Click "Talk to AI Sales Consultant" and allow microphone access.
4. Confirm the waveform animates and a live transcript appears.
5. Confirm the AI responds with audio, and that ending the call produces a report.

If audio doesn't flow, check the browser console for Vapi SDK errors first — this is almost always a missing/incorrect `VITE_VAPI_PUBLIC_KEY` or an Assistant ID mismatch.

## 7. Production Deployment

### Frontend → Vercel

1. Import the repo into Vercel.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build` — Output directory: `dist`.
4. Add all variables from `frontend/.env.example` as Vercel Environment Variables, pointing `VITE_API_BASE_URL` / `VITE_SOCKET_URL` at your deployed backend.

### Backend → Render

1. Create a new Web Service from the repo.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run prisma:generate`
4. Start command: `npm start`
5. Add all variables from `backend/.env.example` as Render Environment Variables. Set `CLIENT_URL` and `ALLOWED_ORIGINS` to your Vercel domain.

### Database → Neon

1. Create a Neon project and database.
2. Copy the pooled connection string into `DATABASE_URL` on Render.
3. From your local machine (with `backend/.env` pointed at the Neon URL), run:

```bash
npm run prisma:deploy --workspace=backend
```

This applies committed migrations to the production database without generating new ones.

## Known Accepted Risk

`npm audit` reports 3 moderate advisories, all tracing back to a single transitive
`uuid` finding (GHSA-w5hq-g745-h8pq: missing bounds check in `uuid` v3/v5/v6 *when
a `buf` argument is explicitly passed*). `@langchain/core` only calls `uuidv4()`
internally with no `buf` argument, so this codebase never exercises the vulnerable
path. The only fix is a semver-major LangChain 1.x upgrade, which would require
re-validating the Conversation Brain, Customer DNA Generator, and Report Generator's
structured-output calls against a substantially restructured API. Given the
negligible practical exploitability, this is accepted as a tracked follow-up rather
than an urgent breaking migration. Re-run `npm audit` periodically and revisit if a
non-major fix becomes available.

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| `PrismaClientInitializationError` | `DATABASE_URL` missing/incorrect, or `prisma:generate` not run |
| CORS errors in browser console | `ALLOWED_ORIGINS` on backend doesn't include the frontend origin |
| No mic audio captured | Browser blocked mic permission, or site not served over HTTPS/localhost |
| No AI voice response | Missing/invalid `VITE_VAPI_PUBLIC_KEY`, or the Assistant ID doesn't match `VAPI_ASSISTANT_ID` |
| Call ends but no report/lead data appears | `VAPI_WEBHOOK_BASE_URL` not set or not publicly reachable — Vapi can't deliver the end-of-call webhook |
