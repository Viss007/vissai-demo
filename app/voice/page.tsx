export default function VoicePage() {
  const demoPath = '/voice-demo/setup.html'
  // No runtime FS check on server; we just link/iframe and let the browser handle 404 if missing
  return (
    <div className="container">
      <h1>Voice</h1>
      <p style={{ color: '#a0a3ad' }}>Embedded static demo from <code>public/voice-demo</code>.</p>
      <div className="card" style={{ padding: 0 }}>
        <iframe src={demoPath} title="Voice Demo" style={{ width: '100%', height: '70vh', border: 'none' }} />
      </div>
      <p style={{ marginTop: '1rem' }}>
        If the demo doesn’t load, open <a href={demoPath} target="_blank" rel="noreferrer">{demoPath}</a> in a new tab.
      </p>
      <p><a href="/">← Back to Home</a></p>
    </div>
  )
}