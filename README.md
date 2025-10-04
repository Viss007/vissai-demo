
# Voice Bot Demo (Next.js + OpenAI Realtime API) — Railway-ready

## What this is

- Next.js app with two parts:
  - Classic automation demo endpoints:
    - `GET /api/healthz` — health JSON with counters and avg latency
    - `POST /api/run` — `{ name, phone, reason, action, lang } → { id, intent, draft, latency }`
  - Realtime voice demo using OpenAI Realtime API over WebRTC at `/voicebot/webrtc`
- Additional API:
  - `POST /api/realtime/ephemeral` — mints short‑lived OpenAI Realtime session token

## Local development

```bash
npm ci
echo "OPENAI_API_KEY=your_key_here" >> .env.local   # needed for realtime demo
npm run dev
# Open classic static root: http://localhost:3000/voicebot/index.html
# Or the realtime demo:     http://localhost:3000/voicebot/webrtc
```

## Voice Demo Features

- Real-time voice conversation with OpenAI GPT-4o
- WebRTC audio streaming with minimal latency
- Live transcripts showing partial and complete user/bot speech
- Production-safe ephemeral key flow (API key stays on server)
- Works on mobile with proper autoplay handling

## Deploy to Railway (drag & drop via GitHub)

1. Create a new GitHub repo and push this folder.
2. In Railway: New Project → Deploy from GitHub → select the repo.
3. Add environment variable: `OPENAI_API_KEY=your_openai_key`
4. Railway auto-detects Node. Build: `npm run build`. Start: `next start -p $PORT`.
5. After deploy, test:
   - `/api/healthz` (should return JSON with `ok: true`)
   - `/voicebot/index.html` (static demo root)
   - `/voicebot/webrtc` (grant mic → start talking)

## API examples

Health check:

```bash
curl -fsSL $HOST/api/healthz
```

Get ephemeral session (requires OPENAI_API_KEY):

```bash
curl -X POST $HOST/api/realtime/ephemeral -H 'content-type: application/json'
```

## Architecture & Tech Stack

- Frontend: Next.js 15, TypeScript, React 19
- WebRTC: RTCPeerConnection with OpenAI Realtime API
- Audio: MediaStream API with autoplay policy handling
- Security: Ephemeral keys (server-only API key access)
- Deployment: Railway-ready with Docker support

## How to Extend

- Add new endpoints in `app/api/`
- Customize voice prompts via the WebRTC data channel
- Add push-to-talk functionality (mute/unmute tracks)
- Integrate with Twilio for phone support

## Docker

```bash
docker build -t voice-demo .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key voice-demo
```

## Notes

- Ephemeral tokens are short-lived (fetched right before WebRTC connection)
- No secrets are exposed to the browser
- Works on iOS Safari with proper audio handling
- Uses standard STUN servers for NAT traversal

---
Updated on 2025-10-04.
