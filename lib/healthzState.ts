// Shared in-memory state for /api/healthz route & tests
export let requestCount = 0
export let draftCount = 0
let totalLatency = 0
let latencyCount = 0

export function recordRequest(latencyMs: number) {
  requestCount++
  totalLatency += latencyMs
  latencyCount++
}

export function avgLatency() {
  return latencyCount > 0 ? totalLatency / latencyCount : 0
}

export function resetHealthzCounters() {
  requestCount = 0
  draftCount = 0
  totalLatency = 0
  latencyCount = 0
}

export function incrementDrafts() { draftCount++ }