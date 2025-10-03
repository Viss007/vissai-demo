"use client"
import { useEffect, useState } from 'react'
import Collapsible from './Collapsible'

export default function HealthPanel() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/healthz', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>Health</h2>
      <div className="card">
        <div className="actions">
          <a href="/api/healthz" target="_blank" rel="noreferrer">Open raw</a>
          <button onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        {error && <div className="error" role="alert">{error}</div>}
        <div aria-live="polite">
          <Collapsible title="/api/healthz JSON">
            <pre>{data ? JSON.stringify(data, null, 2) : '—'}</pre>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
