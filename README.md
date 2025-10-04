# Voice Bot Demo (Next.js + OpenAI Realtime API) — Railway-ready

## What this is

- A Next.js app with voice-to-voice conversation using OpenAI Realtime API over WebRTC
- API endpoints:
  - `GET /api/healthz` — health check with timestamp
  - `POST /api/realtime/ephemeral` — creates ephemeral OpenAI session tokens
- **Voice Demo:** Real-time voice conversation at `/voicebot/webrtc`

## One-minute local run

```bash
npm ci
# Add your OpenAI API key to .env.local:
echo "OPENAI_API_KEY=your_key_here" >> .env.local
npm run dev
# open http://localhost:3000/voicebot/webrtc
```

## Voice Demo Features

- **Real-time voice conversation** with OpenAI GPT-4o
- **WebRTC audio** streaming with minimal latency
- **Live transcripts** showing partial and complete user/bot speech
- **Production-safe** ephemeral key flow (API key stays on server)
- **Works on mobile** with proper autoplay handling

## Deploy to Railway (drag & drop via GitHub)

1. Create a **new GitHub repo** and push this folder.
2. In Railway: New Project → Deploy from GitHub → select the repo.
3. Add environment variable: `OPENAI_API_KEY=your_openai_key`
4. Railway auto-detects Node. Build: `npm run build`. Start: `next start -p $PORT`.
5. After deploy, test:
   - `/api/healthz` (should return JSON with `ok: true`)
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

- **Frontend:** Next.js 14 with TypeScript and React hooks
- **WebRTC:** RTCPeerConnection with OpenAI Realtime API
- **Audio:** MediaStream API with autoplay policy handling
- **Security:** Ephemeral keys (server-only API key access)
- **Deployment:** Railway-ready with Docker support

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
Generated on 2025-10-04.
