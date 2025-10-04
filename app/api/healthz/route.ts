import { NextResponse } from 'next/server'
import { requestCount, draftCount, recordRequest, avgLatency } from '../../../lib/healthzState'

export async function GET() {
  const startTime = Date.now()
  
  const endTime = Date.now()
  const currentLatency = endTime - startTime
  recordRequest(currentLatency)
  const average = avgLatency()

  return NextResponse.json({
    ok: true,
    requests: requestCount,
    drafts: draftCount,
    avgLatency: Math.round(average * 100) / 100,
    timestamp: new Date().toISOString()
  })
}
