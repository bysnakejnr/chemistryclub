import { PeriodicTable } from '../components/PeriodicTable'

export function LandingPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="badge">
            <span className="badge-dot" />
            Live periodic table
          </div>
          <h1 className="page-title" style={{ marginTop: 6 }}>
            Chem Club home
          </h1>
          <p className="page-subtitle">
            Explore elements the way your club actually talks about them: uses, stories, and where
            we meet them in real life.
          </p>
        </div>
      </div>
      <PeriodicTable />
    </div>
  )
}

