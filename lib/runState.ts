// Shared state for /api/run route to avoid invalid Next.js route exports
export let draftCount = 0
export function resetRunCounters() { draftCount = 0 }
export function incrementDrafts() { draftCount++ }