# Voice Bot Demo (Next.js + OpenAI Realtime API) — Railway-ready# Voice Bot Demo (Next.js + OpenAI Realtime API) — Railway-ready



## What this is**What this is**

- A tiny Next.js app with two endpoints:

- A Next.js app with voice-to-voice conversation using OpenAI Realtime API over WebRTC  - `GET /api/healthz` — counters for requests/drafts/avgLatency.

- API endpoints:  - `POST /api/run` — accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and **draft email/SMS**.

  - `GET /api/healthz` — health check with request counters and latency stats- A **static voice demo** is included at `/voice-demo/` (from your design ZIP), plus a simple `/voice` page that links to it.

  - `POST /api/run` — accepts `{ name, phone, reason, action, lang }` and returns an ID, inferred intent, and draft message (email/SMS)

  - `POST /api/realtime/ephemeral` — creates ephemeral OpenAI session tokens## One-minute local run

  - `POST /api/chat` — server-side OpenAI proxy with rate limiting```bash

- **Voice Demo:** Real-time voice conversation at `/voicebot/webrtc`npm ci

- **Static Demo:** Additional voice interface at `/voice-demo/`npm run dev

# open http://localhost:3000/voice-demo/setup.html

## One-minute local run```



```bash## Voice Demo Features

npm ci

# Add your OpenAI API key to .env.local:- **Real-time voice conversation** with OpenAI GPT-4o

echo "OPENAI_API_KEY=your_key_here" >> .env.local- **WebRTC audio** streaming with minimal latency

npm run dev- **Live transcripts** showing partial and complete user/bot speech

# open http://localhost:3000/voicebot/webrtc- **Production-safe** ephemeral key flow (API key stays on server)

```- **Works on mobile** with proper autoplay handling



## Voice Demo Features## Deploy to Railway (drag & drop via GitHub)



- **Real-time voice conversation** with OpenAI GPT-4o1. Create a **new GitHub repo** and push this folder.

- **WebRTC audio** streaming with minimal latency2. In Railway: New Project → Deploy from GitHub → select the repo.

- **Live transcripts** showing partial and complete user/bot speech3. Railway auto-detects Node. Build: `npm run build`. Start: `next start -p $PORT` (already in package.json).

- **Production-safe** ephemeral key flow (API key stays on server)4. After deploy, open:

- **Works on mobile** with proper autoplay handling   - `/api/healthz` (should return JSON with `ok: true`).

   - `/voice-demo/setup.html` (fill form → test demo).

## Deploy to Railway (drag & drop via GitHub)

## API examples

1. Create a **new GitHub repo** and push this folder.

2. In Railway: New Project → Deploy from GitHub → select the repo.Health check:

3. Railway auto-detects Node. Build: `npm run build`. Start: `npm start` (already in package.json).

4. Set environment variable: `OPENAI_API_KEY=your_key_here````bash

5. After deploy, open:curl -fsSL $HOST/api/healthz

   - `/api/healthz` (should return JSON with `ok: true`).```

   - `/voicebot/webrtc` (live voice chat).

   - `/voice-demo/setup.html` (static demo interface).Get ephemeral session (requires OPENAI_API_KEY):



## API Examples```bash

curl -X POST $HOST/api/run -H 'content-type: application/json' -d '{

Health check:  "name":"Austėja","phone":"+370...", "reason":"Norėčiau rezervuoti", "action":"bookings", "lang":"lt"

```bash}'

curl -fsSL $HOST/api/healthz```

```

## Customize messages & behavior

Create ephemeral session (requires OPENAI_API_KEY):- Tweak `app/api/run/route.ts` → `replyDraft` to change Lithuanian/English drafts.

```bash- The static demo JavaScript (`/public/voice-demo/script.js`) calls `/api/run` and `/api/healthz` on the same origin.

curl -X POST $HOST/api/realtime/ephemeral \

  -H 'content-type: application/json' \## Docker

  -d '{"model": "gpt-4o-realtime-preview"}'```bash

```docker build -t engine-demo .

docker run -p 3000:3000 engine-demo

Triage request:```

```bash

curl -X POST $HOST/api/run -H 'content-type: application/json' -d '{## Notes

  "name":"Austėja","phone":"+370...", "reason":"Norėčiau rezervuoti", "action":"bookings", "lang":"lt"- In-memory counters reset on redeploy.

}'- No secrets are required for this demo; you can add `OPENAI_API_KEY` later if you wire Realtime or completions.

```

---

Chat with OpenAI:Generated on 2025-10-03.

```bash
curl -X POST $HOST/api/chat -H 'content-type: application/json' -d '{
  "message": "Say hello in one sentence"
}'
```

## Local Development

**Dependencies:**
```bash
npm ci
```

**Environment setup:**
Copy `.env.example` to `.env.local` and add your OpenAI API key.

**Development server:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Testing:**
```bash
npm test
```

## Customize messages & behavior

- Tweak `app/api/run/route.ts` → `replyDraft` to change Lithuanian/English drafts.
- Modify `app/api/realtime/ephemeral/route.ts` for session configuration.
- Update static demo JavaScript (`public/voice-demo/script.js`) for UI changes.
- Configure rate limits and counters in `lib/healthzState.ts` and `lib/runState.ts`.

## Project Structure

```
app/
├── api/
│   ├── healthz/route.ts      # Health check endpoint
│   ├── run/route.ts          # Main triage API
│   ├── chat/route.ts         # OpenAI chat proxy
│   └── realtime/
│       └── ephemeral/route.ts # Realtime session tokens
├── voicebot/
│   ├── page.tsx              # Voicebot landing page
│   └── webrtc/page.tsx       # Real-time voice interface
└── voice/page.tsx            # Static voice demo link

public/
├── voicebot/                 # Static voicebot assets
└── voice-demo/               # Static demo interface

lib/
├── healthzState.ts           # Request counters
└── runState.ts              # Triage state management
```

## Docker Support

Build and run with Docker:
```bash
docker build -t voice-bot-demo .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key voice-bot-demo
```

The Dockerfile includes health checks and multi-stage builds for production optimization.