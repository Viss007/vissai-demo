import { GET } from '../app/api/healthz/route'
import { resetHealthzCounters } from '../lib/healthzState'
import { describe, it, expect, beforeEach } from 'vitest'

// Minimal NextResponse json() polyfill not needed because handler returns NextResponse already.

describe('/api/healthz GET', () => {
  beforeEach(() => {
    resetHealthzCounters()
  })

  it('returns ok true and increments counters', async () => {
    const res1 = await GET()
    const data1 = await (res1 as any).json()
    expect(data1.ok).toBe(true)
    expect(data1.requests).toBe(1)

    const res2 = await GET()
    const data2 = await (res2 as any).json()
    expect(data2.requests).toBe(2)
    expect(data2.ok).toBe(true)
  })
})
