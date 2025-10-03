# Automation Engine Demo (Next.js + API) — Railway-ready

**What this is**
- A tiny Next.js app with two endpoints:
  - `GET /api/healthz` — counters for requests/drafts/avgLatency.
  - `POST /api/run` — accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and **draft email/SMS**.
- A **static voice demo** is included at `/voice-demo/` (from your design ZIP), plus a simple `/voice` page that links to it.

## One-minute local run
```bash
npm ci
npm run dev
# open http://localhost:3000/voice-demo/setup.html
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
```bash
docker build -t engine-demo .
docker run -p 3000:3000 engine-demo
```

## Notes
- In-memory counters reset on redeploy.
- No secrets are required for this demo; you can add `OPENAI_API_KEY` later if you wire Realtime or completions.

---
Generated on 2025-10-03.
