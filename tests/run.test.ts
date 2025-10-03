import { POST, __resetRunCounters } from '../app/api/run/route'
import { describe, it, expect, beforeEach } from 'vitest'

function makeRequest(body: any) {
  return new Request('http://localhost/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

describe('/api/run POST', () => {
  beforeEach(() => {
    __resetRunCounters()
  })

  it('returns draft for valid body', async () => {
    const req = makeRequest({ name: 'Alice', phone: '+123', reason: 'Need info', action: 'information', lang: 'en' })
    const res = await POST(req as any)
    const data = await (res as any).json()
    expect(data.ok).toBe(true)
    expect(data.id).toBeDefined()
    expect(data.intent).toBeDefined()
    expect(data.draft).toContain('Alice')
    expect(typeof data.latency).toBe('number')
  })

  it('returns 400 for invalid body (empty reason)', async () => {
    const badReq = makeRequest({ reason: '' })
    const res = await POST(badReq as any)
    expect(res.status).toBe(400)
    const data = await (res as any).json()
    expect(data.ok).toBe(false)
    expect(Array.isArray(data.errors)).toBe(true)
  })
})
