import RunForm from './components/RunForm'
import HealthPanel from './components/HealthPanel'

export default function Home() {
  return (
    <div>
      <h1>Automation Engine</h1>
      <p style={{ color: '#a0a3ad' }}>Play with the API and watch health in real time.</p>
      <div className="grid">
        <div className="card"><RunForm /></div>
        <div className="card"><HealthPanel /></div>
      </div>
    </div>
  )
}