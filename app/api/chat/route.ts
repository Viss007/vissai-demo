import { NextRequest, NextResponse } from 'next/server'

type ChatBody = { message?: string }

const RATE = { windowMs: 5 * 60 * 1000, max: 10 } // 10 req / 5 min / IP (demo)
const bucket = new Map<string, { ts: number[] }>()

function allow(ip: string) {
  const now = Date.now()
  const rec = bucket.get(ip) ?? { ts: [] }
  rec.ts = rec.ts.filter(t => now - t < RATE.windowMs)
  if (rec.ts.length >= RATE.max) return false
  rec.ts.push(now)
  bucket.set(ip, rec)
  return true
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  
  if (!allow(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limit" }, { status: 429 })
  }
  
  let body: ChatBody
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  
  const msg = (body.message ?? "").trim()
  if (!msg) {
    return NextResponse.json({ ok: false, error: "message required" }, { status: 400 })
  }
  
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Server missing OPENAI_API_KEY" }, { status: 500 })
  }
  
  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a concise demo assistant. Keep replies <= 120 words."
      },
      {
        role: "user", 
        content: msg
      }
    ],
    max_tokens: 300
  }
  
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload)
    })
    
    if (!r.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: "OpenAI upstream error", 
        detail: await r.text() 
      }, { status: 502 })
    }
    
    const data = await r.json()
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't produce a reply."
    
    return NextResponse.json({ 
      ok: true, 
      reply, 
      latency: Date.now() - t0 
    })
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 })
  }
}