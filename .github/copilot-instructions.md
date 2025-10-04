# Copilot Instructions for vissai-demo

## Project Overview
- **Type:** Next.js app with custom API endpoints and a static voice demo.
- **Endpoints:**
  - `GET /api/healthz`: Returns request counters and latency stats.
  - `POST /api/run`: Accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and draft message (email/SMS).
- **Voice Demo:** Static HTML/JS at `/voice-demo/` and a simple `/voice` page linking to it.

## Key Files & Structure
- `app/api/run/route.ts`: Main API logic, including message drafting (customize reply logic here).
- `public/voice-demo/script.js`: Static demo JS, calls API endpoints.
- `package.json`: Defines build/start commands for local and Railway deploys.
- `Dockerfile`: For container builds; exposes port 3000.
- `README.md`: Contains setup, deploy, and API usage instructions.

## Developer Workflows
- **Local Development:**
  - Install: `npm ci`
  - Run: `npm run dev`
  - Access: [http://localhost:3000/voice-demo/setup.html](http://localhost:3000/voice-demo/setup.html)
- **Docker:**
  - Build: `docker build -t engine-demo .`
  - Run: `docker run -p 3000:3000 engine-demo`
- **Railway Deploy:**
  - Build: `npm run build`
  - Start: `next start -p $PORT`

## Patterns & Conventions
- **API Drafting:**
  - Message drafts (email/SMS) are generated in `replyDraft` within `app/api/run/route.ts`.
  - Supports Lithuanian and English; customize logic for other languages or actions here.
- **Counters:**
  - In-memory only; reset on redeploy.
- **No secrets required** for basic demo. Add `OPENAI_API_KEY` if integrating with external services.
- **Static assets** for the voice demo are in `public/voice-demo/`.

## Integration Points
- **External API keys** (e.g., OpenAI) are optional and not required for the demo.
- **All API calls** in the static demo are same-origin.

## Example API Usage
```bash
curl -X POST $HOST/api/run -H 'content-type: application/json' -d '{
  "name":"Austėja","phone":"+370...", "reason":"Norėčiau rezervuoti", "action":"bookings", "lang":"lt"
}'
```

## How to Extend
- Add new endpoints in `app/api/`.
- Extend message logic in `app/api/run/route.ts`.
- Add static assets to `public/voice-demo/`.

---
_Last updated: 2025-10-04_
