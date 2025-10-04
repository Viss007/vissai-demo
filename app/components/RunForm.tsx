"use client"
import { useState } from 'react'
import Collapsible from './Collapsible'

type RunBody = {
  name?: string
  phone?: string
  reason?: string
  action?: string
  lang?: 'en' | 'lt'
}

type ErrorIssue = { path?: string; message: string }

export default function RunForm() {
  const [body, setBody] = useState<RunBody>({ lang: 'en' })
  const [status, setStatus] = useState<number | null>(null)
  const [errors, setErrors] = useState<ErrorIssue[] | null>(null)
  const [response, setResponse] = useState<any>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null); setErrors(null); setResponse(null)
    try {
      const res = await fetch('/api/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      setStatus(res.status)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors(json?.errors ?? [{ message: 'Unknown error' }])
      }
      setResponse(json)
    } catch (err: any) {
      setStatus(0)
      setErrors([{ message: err?.message ?? 'Network error' }])
    }
  }

  function set<K extends keyof RunBody>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setBody({ ...body, [key]: e.target.value })
  }

  return (
    <div>
      <h2>API Playground</h2>
      <form onSubmit={onSubmit} className="card" aria-describedby="error-summary">
        <div className="grid-2">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" onChange={set('name')} value={body.name ?? ''} />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" onChange={set('phone')} value={body.phone ?? ''} />
          </div>
          <div className="col-span-2">
            <label htmlFor="reason">Reason</label>
            <textarea id="reason" rows={3} onChange={set('reason')} value={body.reason ?? ''} />
          </div>
          <div>
            <label htmlFor="action">Action</label>
            <input id="action" type="text" onChange={set('action')} value={body.action ?? ''} />
          </div>
          <div>
            <label htmlFor="lang">Language</label>
            <select id="lang" onChange={set('lang')} value={body.lang ?? 'en'}>
              <option value="en">English</option>
              <option value="lt">Lietuvių</option>
            </select>
          </div>
        </div>
        <div className="actions">
          <button type="submit">Send</button>
          {status !== null && <span className="status">HTTP {status}</span>}
        </div>
      </form>

      {errors && errors.length > 0 && (
        <div id="error-summary" className="error" role="alert" aria-live="polite">
          <strong>Errors:</strong>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e.path ? `${e.path}: ` : ''}{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="stack">
        <Collapsible title="Request JSON">
          <pre>{JSON.stringify(body, null, 2)}</pre>
        </Collapsible>
        <Collapsible title="Response JSON">
          <pre>{response ? JSON.stringify(response, null, 2) : '—'}</pre>
        </Collapsible>
      </div>
    </div>
  )
}
