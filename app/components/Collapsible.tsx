"use client"
import { useState, PropsWithChildren } from 'react'

export default function Collapsible({ title, children }: PropsWithChildren<{ title: string }>) {
  const [open, setOpen] = useState(true)
  return (
    <div className="collapsible">
      <button className="collapsible__toggle" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        {open ? '▾' : '▸'} {title}
      </button>
      {open && <div className="collapsible__content" aria-live="polite">{children}</div>}
    </div>
  )
}
