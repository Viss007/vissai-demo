export default function VoicePage() {
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Voice Demo</h1>
      <p>Welcome to the voice automation demo!</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Available Demos:</h2>
        <ul>
          <li>
            <a href="/voice-demo/setup.html" style={{ color: '#007bff', textDecoration: 'none' }}>
              Interactive Form Demo
            </a>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Fill out a form and see how the automation engine processes your request
            </p>
          </li>
        </ul>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
        <h3>API Endpoints:</h3>
        <ul>
          <li><code>/api/healthz</code> - Health check and statistics</li>
          <li><code>/api/run</code> - Submit automation requests</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </a>
      </div>
    </div>
  )
}