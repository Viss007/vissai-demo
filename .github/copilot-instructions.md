# Copilot Instructions for This Repo (vissai-demo)
# Copilot Instructions for This Repo (vissai-demo)

Purpose: make coding agents effective on first try. Keep diffs small, runnable, and verifiable.

## Big Picture
  - `app/page.tsx` (redirect), `app/voicebot/page.tsx` (route fallback), `next.config.js` (rewrites).
  - GET /api/healthz — health JSON (requests, drafts, avgLatency, timestamp)
  - POST /api/run — triage stub: `{ name, phone, reason, action, lang } → { id, intent, draft, latency }`
  - POST /api/chat — server-only OpenAI Responses proxy + tiny rate limit
  - POST /api/realtime/ephemeral — mints OpenAI Realtime ephemeral token (short‑lived) for WebRTC

## Dev Workflow
  - `npm run build && PORT=3001 npm start &`
  - `curl -fsSL http://localhost:3001/api/healthz`
  - `curl -fsSL -X POST http://localhost:3001/api/run -H 'content-type: application/json' -d '{"name":"Test","phone":"+123","reason":"info","action":"booking","lang":"en"}'`
  - `curl -fsSL -X POST http://localhost:3001/api/chat -H 'content-type: application/json' -d '{"message":"Say hi in one sentence."}'`
  - `curl -fsSL -X POST http://localhost:3001/api/realtime/ephemeral`
  - `pkill -f "next start"`

## Deployment (Railway)

## Conventions & Patterns

## Gotchas

## File Map

## Acceptance Before Merge
