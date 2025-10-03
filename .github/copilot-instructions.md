# Copilot Instructions for This Repo (vissai-demo)

**Purpose:** Make coding agents effective here on the first try. Keep diffs small, runnable, and verifiable.

## Big Picture
- **Stack:** Next.js **15** (App Router, TS). Hybrid: static UI + API routes.
- **Static root:** homepage redirects to `public/voicebot/index.html` via:
  - `app/page.tsx` (redirect), `app/voicebot/page.tsx` (route fallback), `next.config.js` (rewrites).
- **APIs:**
  - `GET /api/healthz` — health JSON (requests, drafts, avgLatency).
  - `POST /api/run` — triage stub: `{ name, phone, reason, action, lang } → { id, intent, draft, latency }`.
  - `POST /api/chat` — **server-only** OpenAI Responses proxy + tiny rate limit.

## Dev Workflow
- **Install:** `npm ci` (or `npm install`)  
- **Dev:** `npm run dev` · **Build:** `npm run build` · **Start (prod):** `npm start` (**binds $PORT**)  
- **Tests:** `npm test` (Vitest)
- **Local smoke (prod quick):**
  - `npm run build && PORT=3001 npm start &`
  - `curl -fsSL http://localhost:3001/api/healthz`
  - `curl -fsSL -X POST http://localhost:3001/api/run -H 'content-type: application/json' -d '{"name":"Test","phone":"+123","reason":"info","action":"booking","lang":"en"}'`
  - `curl -fsSL -X POST http://localhost:3001/api/chat -H 'content-type: application/json' -d '{"message":"Say hi in one sentence."}'`
  - `pkill -f "next start"`

## Deployment (Railway)
- Dockerfile **multi-stage**; HEALTHCHECK probes `http://localhost:${PORT}/api/healthz`.
- **Start command must be `npm start`** (don't run `next` binary directly).
- **Env (Railway Variables):** `OPENAI_API_KEY` (for /api/chat); optional `NEXT_PUBLIC_SITE_URL`.
- **Actions Smoke** uses **repo secret** `PROD_BASE_URL` (not the Railway var).

## Conventions & Patterns
- **Static root:** place files under `public/voicebot/`; **use relative asset paths**.
- **Routing safety-net:** keep `app/voicebot/page.tsx` so `/voicebot` never 404s.
- **APIs:** small handler per route; return `{ ok, ... }`; in-memory counters/rate-limits for demo only.
- **OpenAI:** `/api/chat` is server-side proxy (Responses API), low `max_output_tokens`, tiny rate-limit bucket.
- **PRs:** small & verifiable; include **curl outputs** in PR body.

## Gotchas
- `/voicebot` 404 ⇒ missing route fallback/rewrites **or** not redeployed.
- Unhealthy container ⇒ HEALTHCHECK must use **$PORT**.
- "next not found" ⇒ ensure runtime uses **`npm start`** (PATH includes `.bin`).
- Secrets: **never client-side**; no `.env` committed.

## File Map
- **Static routing:** `app/page.tsx`, `app/voicebot/page.tsx`, `next.config.js`
- **APIs:** `app/api/healthz/route.ts`, `app/api/run/route.ts`, `app/api/chat/route.ts`
- **Static UI:** `public/voicebot/` (index.html, setup.html, voicebot.html, style.css, script.js)
- **CI:** `.github/workflows/ci.yml`, `.github/workflows/smoke.yml`

## Acceptance Before Merge
- `npm run build` passes; PR is minimal; attach curl proofs.
- If deployment-bound change: include **Railway → Redeploy latest main** in PR checklist.