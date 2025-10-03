import { NextResponse } from 'next/server'

// In-memory counters (reset on redeploy)
export let requestCount = 0
export let draftCount = 0
let totalLatency = 0
let latencyCount = 0

export function __resetHealthzCounters() {
  requestCount = 0
  draftCount = 0
  totalLatency = 0
  latencyCount = 0
}

export async function GET() {
  const startTime = Date.now()
  
  requestCount++
  
  const avgLatency = latencyCount > 0 ? totalLatency / latencyCount : 0
  
  const endTime = Date.now()
  const currentLatency = endTime - startTime
  totalLatency += currentLatency
  latencyCount++
  
  return NextResponse.json({
    ok: true,
    requests: requestCount,
    drafts: draftCount,
    avgLatency: Math.round(avgLatency * 100) / 100,
    timestamp: new Date().toISOString()
  })
}