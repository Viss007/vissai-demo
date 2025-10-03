import { POST } from '../app/api/chat/route'
import { describe, it, expect } from 'vitest'

function makeRequest(body: any, headers: Record<string,string> = {}) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  })
}

describe('/api/chat POST', () => {
  it('400 when message missing', async () => {
    const req = makeRequest({ })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const data = await (res as any).json()
    expect(data.ok).toBe(false)
    expect(data.error).toMatch(/message required/i)
  })

  it('500 when OPENAI_API_KEY missing', async () => {
    const prev = process.env.OPENAI_API_KEY
    delete (process.env as any).OPENAI_API_KEY
    const req = makeRequest({ message: 'hi' })
    const res = await POST(req as any)
    const data = await (res as any).json()
    expect(res.status).toBe(500)
    expect(data.ok).toBe(false)
    expect(String(data.error)).toMatch(/missing OPENAI_API_KEY/i)
    if (prev) process.env.OPENAI_API_KEY = prev
  })
})
