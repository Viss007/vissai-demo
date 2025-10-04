# Copilot Instructions for This Repo (vissai-demo)# Copilot Instructions for vissai-demo



**Purpose:** Make coding agents effective here on the first try. Keep diffs small, runnable, and verifiable.## Project Overview

- **Type:** Next.js app with custom API endpoints and a static voice demo.

## Big Picture- **Endpoints:**

- **Stack:** Next.js **15** (App Router, TS). Hybrid: static UI + API routes.  - `GET /api/healthz`: Returns request counters and latency stats.

- **Static root:** homepage redirects to `public/voicebot/index.html` via:  - `POST /api/run`: Accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and draft message (email/SMS).

  - `app/page.tsx` (redirect), `app/voicebot/page.tsx` (route fallback), `next.config.js` (rewrites).- **Voice Demo:** Static HTML/JS at `/voice-demo/` and a simple `/voice` page linking to it.

- **APIs:**

  - `GET /api/healthz` — health JSON (requests, drafts, avgLatency).## Key Files & Structure

  - `POST /api/run` — triage stub: `{ name, phone, reason, action, lang } → { id, intent, draft, latency }`.- `app/api/run/route.ts`: Main API logic, including message drafting (customize reply logic here).

  - `POST /api/chat` — **server-only** OpenAI Responses proxy + tiny rate limit.- `public/voice-demo/script.js`: Static demo JS, calls API endpoints.

- `package.json`: Defines build/start commands for local and Railway deploys.

## Dev Workflow- `Dockerfile`: For container builds; exposes port 3000.

- **Install:** `npm ci` (or `npm install`)  - `README.md`: Contains setup, deploy, and API usage instructions.

- **Dev:** `npm run dev` · **Build:** `npm run build` · **Start (prod):** `npm start` (**binds $PORT**)  

- **Tests:** `npm test` (Vitest)## Developer Workflows

- **Local smoke (prod quick):**- **Local Development:**

  - `npm run build && PORT=3001 npm start &`  - Install: `npm ci`

  - `curl -fsSL http://localhost:3001/api/healthz`  - Run: `npm run dev`

  - `curl -fsSL -X POST http://localhost:3001/api/run -H 'content-type: application/json' -d '{"name":"Test","phone":"+123","reason":"info","action":"booking","lang":"en"}'`  - Access: [http://localhost:3000/voice-demo/setup.html](http://localhost:3000/voice-demo/setup.html)

  - `curl -fsSL -X POST http://localhost:3001/api/chat -H 'content-type: application/json' -d '{"message":"Say hi in one sentence."}'`- **Docker:**

  - `pkill -f "next start"`  - Build: `docker build -t engine-demo .`

  - Run: `docker run -p 3000:3000 engine-demo`

## Deployment (Railway)- **Railway Deploy:**

- Dockerfile **multi-stage**; HEALTHCHECK probes `http://localhost:${PORT}/api/healthz`.  - Build: `npm run build`

- **Start command must be `npm start`** (don't run `next` binary directly).  - Start: `next start -p $PORT`

- **Env (Railway Variables):** `OPENAI_API_KEY` (for /api/chat); optional `NEXT_PUBLIC_SITE_URL`.

- **Actions Smoke** uses **repo secret** `PROD_BASE_URL` (not the Railway var).## Deployment (Railway)

- Dockerfile **multi-stage**; HEALTHCHECK probes `http://localhost:${PORT}/api/healthz`.

## Conventions & Patterns- **Start command must be `npm start`** (don't run `next` binary directly).

- **Static root:** place files under `public/voicebot/`; **use relative asset paths**.- **Env (Railway Variables):** `OPENAI_API_KEY` (for /api/chat); optional `NEXT_PUBLIC_SITE_URL`.

- **Routing safety-net:** keep `app/voicebot/page.tsx` so `/voicebot` never 404s.- **Actions Smoke** uses **repo secret** `PROD_BASE_URL` (not the Railway var).

- **APIs:** small handler per route; return `{ ok, ... }`; in-memory counters/rate-limits for demo only.

- **Shared state:** `lib/healthzState.ts` & `lib/runState.ts` hold counters (reset on redeploy).## Conventions & Patterns

- **OpenAI:** `/api/chat` is server-side proxy (Responses API), low `max_output_tokens`, tiny rate-limit bucket.- **Static root:** place files under `public/voicebot/`; **use relative asset paths**.

- **Validation:** Zod schemas; `/api/run` supports `lang:'en'|'lt'` for draft localization.- **Routing safety-net:** keep `app/voicebot/page.tsx` so `/voicebot` never 404s.

- **Tests:** Vitest; mock NextRequest with `new Request(url, {method, headers, body})`.- **APIs:** small handler per route; return `{ ok, ... }`; in-memory counters/rate-limits for demo only.

- **PRs:** small & verifiable; include **curl outputs** in PR body.- **OpenAI:** `/api/chat` is server-side proxy (Responses API), low `max_output_tokens`, tiny rate-limit bucket.

- **PRs:** small & verifiable; include **curl outputs** in PR body.

## Gotchas

- `/voicebot` 404 ⇒ missing route fallback/rewrites **or** not redeployed.## Gotchas

- Unhealthy container ⇒ HEALTHCHECK must use **$PORT**.- `/voicebot` 404 ⇒ missing route fallback/rewrites **or** not redeployed.

- "next not found" ⇒ ensure runtime uses **`npm start`** (PATH includes `.bin`).- Unhealthy container ⇒ HEALTHCHECK must use **$PORT**.

- Secrets: **never client-side**; no `.env` committed.- "next not found" ⇒ ensure runtime uses **`npm start`** (PATH includes `.bin`).

- Secrets: **never client-side**; no `.env` committed.

## File Map

- **Static routing:** `app/page.tsx`, `app/voicebot/page.tsx`, `next.config.js`## File Map

- **APIs:** `app/api/healthz/route.ts`, `app/api/run/route.ts`, `app/api/chat/route.ts`- **Static routing:** `app/page.tsx`, `app/voicebot/page.tsx`, `next.config.js`

- **Shared state:** `lib/healthzState.ts`, `lib/runState.ts`- **APIs:** `app/api/healthz/route.ts`, `app/api/run/route.ts`, `app/api/chat/route.ts`

- **Static UI:** `public/voicebot/` (index.html, setup.html, voicebot.html, style.css, script.js)- **Static UI:** `public/voicebot/` (index.html, setup.html, voicebot.html, style.css, script.js)

- **Tests:** `tests/healthz.test.ts`, `tests/run.test.ts`- **CI:** `.github/workflows/ci.yml`, `.github/workflows/smoke.yml`

- **CI:** `.github/workflows/ci.yml`, `.github/workflows/smoke.yml`, `.github/workflows/docker.yml`

## Acceptance Before Merge

## Acceptance Before Merge- `npm run build` passes; PR is minimal; attach curl proofs.

- `npm run build` passes; PR is minimal; attach curl proofs.- If deployment-bound change: include **Railway → Redeploy latest main** in PR checklist.
- If deployment-bound change: include **Railway → Redeploy latest main** in PR checklist.