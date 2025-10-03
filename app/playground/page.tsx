import RunForm from '../components/RunForm'
import HealthPanel from '../components/HealthPanel'

export default function Playground() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Automation Engine</h1>
      <p style={{ color: '#a0a3ad', marginBottom: 20 }}>Play with the API and watch health in real time.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <section style={{ padding: 16, border: '1px solid #2f3136', borderRadius: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>API Playground</h2>
          <RunForm />
        </section>
        <section style={{ padding: 16, border: '1px solid #2f3136', borderRadius: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Health</h2>
          <HealthPanel />
        </section>
      </div>
    </main>
  )
}