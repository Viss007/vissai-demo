# Automation Engine Demo (Next.js + API) — Railway-ready

## What this is

- A tiny Next.js app with two endpoints:
  - `GET /api/healthz` — counters for requests/drafts/avgLatency.
  - `POST /api/run` — accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and **draft email/SMS**.
- A **static voice demo** is included at `/voice-demo/` (from your design ZIP), plus a simple `/voice` page that links to it.


## Development

```bash
npm install   # or npm ci if lockfile present
npm run dev   # starts Next.js on http://localhost:3000
open http://localhost:3000/voice-demo/setup.html
```

## Build & Start (Production)

```bash
npm run build
PORT=3000 npm start   # uses next start -p $PORT
```

## Deploy to Railway (drag & drop via GitHub)

1. Create a **new GitHub repo** and push this folder.
2. In Railway: New Project → Deploy from GitHub → select the repo.
3. Railway auto-detects Node. Build: `npm run build`. Start: `next start -p $PORT` (already in package.json).
4. After deploy, open:

- `/api/healthz` (should return JSON with `ok: true`).
- `/voice-demo/setup.html` (fill form → test demo).

## API examples

```bash
curl -X POST $HOST/api/run -H 'content-type: application/json' -d '{
  "name":"Austėja","phone":"+370...", "reason":"Norėčiau rezervuoti", "action":"bookings", "lang":"lt"
}'
```

## Customize messages & behavior

- Tweak `app/api/run/route.ts` → `replyDraft` to change Lithuanian/English drafts.
- The static demo JavaScript (`/public/voice-demo/script.js`) calls `/api/run` and `/api/healthz` on the same origin.

## Docker

Multi-stage image (non-root, healthcheck) defined in `Dockerfile`.

```bash
docker build -t engine-demo .
docker run -p 3000:3000 --name engine-demo engine-demo
docker inspect --format='{{json .State.Health}}' engine-demo | jq
```

Health check hits `/api/healthz` every 30s; container becomes `healthy` after first successful probe.

## CI

`CI` workflow (Node) runs on PRs & pushes to `main`:

- install deps → typecheck → tests (Vitest) → build

`docker` workflow (GHCR) builds/pushes & signs images (cosign) on `main`, tags & schedule.

## Smoke Test

`Smoke Test` workflow triggers after successful `CI` on `main` (and nightly cron) and `curl`s:

```bash
curl "$PROD_BASE_URL/api/healthz"
```

It fails if `.ok != true`. Configure the secret `PROD_BASE_URL` in repository or environment settings.

## GHCR Images

Images published to: `ghcr.io/<owner>/<repo>:<tag>` via metadata action (sha / branch / semver tags).
Pull example:

```bash
docker pull ghcr.io/OWNER/REPO:sha-<short>
```

## Environment Variables

See `.env.example` for placeholders (`NEXT_PUBLIC_SITE_URL`, future keys). None required for base demo.

## Notes

- In-memory counters reset on redeploy.
- No secrets required for basic demo.
- Add future email / analytics keys in `.env` when extending.

Generated on 2025-10-03.

## UI Overview

Home (/) provides:

- API Playground to POST /api/run with fields: name, phone, reason, action, lang
- Health panel that fetches /api/healthz with a Refresh button
- Collapsible boxes to inspect request/response JSON and health payloads

Voice (/voice):

- Embeds `public/voice-demo/setup.html` in an iframe; includes a fallback link and a back-to-home link

Accessibility/UX:

- Labels on inputs, visible focus states, basic error summary with aria-live on results
