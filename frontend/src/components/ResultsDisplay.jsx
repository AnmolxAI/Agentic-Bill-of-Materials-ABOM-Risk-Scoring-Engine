function ResultsDisplay({ result, onDownloadReport }) {
  const getTierClass = (tier) => `tier-${tier}`

  const getTierName = (tier) => {
    const names = {
      0: 'Passive',
      1: 'Assistive',
      2: 'Bounded',
      3: 'High-Agency',
      4: 'Systemic',
    }
    return names[tier] || 'Unknown'
  }

  const getAgencyLabel = (agency) => {
    const labels = {
      1: 'No tools',
      2: 'Read-only tools',
      4: 'State-changing tools',
      6: 'Critical/Dangerous capabilities',
    }
    return labels[agency] || `Score: ${agency}`
  }

  const getAutonomyLabel = (autonomy) => {
    const labels = {
      1: 'HITL — Human-In-The-Loop',
      2: 'HOTL — Human-On-The-Loop',
      3: 'HOOTL — Human-Out-Of-The-Loop',
    }
    return labels[autonomy] || `Score: ${autonomy}`
  }

  const getPersistenceLabel = (persistence) => {
    const labels = {
      0: 'Ephemeral — No memory',
      1: 'Session — Temporary state',
      2: 'Long-term — Cross-session memory',
    }
    return labels[persistence] || `Score: ${persistence}`
  }

  const hasOverrides = result.tier_4_overrides && result.tier_4_overrides.length > 0

  return (
    <div className="fade-in">
      <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Risk Assessment Results
      </h2>

      {/* Tier 4 Override Warning */}
      {hasOverrides && (
        <div className="warning-banner mb-6">
          <p className="font-semibold mb-2">⚠ Tier 4 Override Triggered</p>
          <ul className="text-sm" style={{ paddingLeft: '1.25rem', listStyle: 'disc' }}>
            {result.tier_4_overrides.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Score Display */}
      <div
        className={`tier-badge ${getTierClass(result.tier)} mb-6`}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderRadius: '8px',
        }}
      >
        <div>
          <p className="text-sm opacity-75 mb-1">Risk Score</p>
          <p className="score-large">{result.score}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="text-sm opacity-75 mb-1">UART Tier</p>
          <p className="score-large">{result.tier}</p>
          <p className="text-sm mt-1" style={{ opacity: 0.8 }}>{getTierName(result.tier)}</p>
        </div>
      </div>

      {/* A-U-P Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Score Components
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard
            label="Agency (A)"
            value={result.agency}
            description={getAgencyLabel(result.agency)}
          />
          <ScoreCard
            label="Autonomy (U)"
            value={result.autonomy}
            description={getAutonomyLabel(result.autonomy)}
          />
          <ScoreCard
            label="Persistence (P)"
            value={result.persistence}
            description={getPersistenceLabel(result.persistence)}
          />
        </div>
      </div>

      {/* Scaffolding Modifier */}
      {result.scaffolding_modifier !== undefined && result.scaffolding_modifier !== 1.0 && (
        <div className="mb-6">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--tier-0-bg)',
              border: '1px solid var(--tier-0)'
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium" style={{ color: 'var(--tier-0)' }}>
                  Scaffolding Modifier Applied
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Safety controls reduce risk by {Math.round((1 - result.scaffolding_modifier) * 100)}%
                </p>
              </div>
              <p className="mono text-2xl font-bold" style={{ color: 'var(--tier-0)' }}>
                ×{result.scaffolding_modifier}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formula */}
      <div className="formula-box mb-6">
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
          Risk Score Formula
        </p>
        <p className="text-lg">
          R = A × U × e<sup>P</sup>{result.scaffolding_modifier !== 1.0 ? ' × modifier' : ''}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {result.agency} × {result.autonomy} × e<sup>{result.persistence}</sup>
          {result.scaffolding_modifier !== 1.0 ? ` × ${result.scaffolding_modifier}` : ''} = {result.score}
        </p>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={onDownloadReport}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Full Report
        </button>
      </div>
    </div>
  )
}

function ScoreCard({ label, value, description }) {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)'
      }}
    >
      <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <p className="mono text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
    </div>
  )
}

export default ResultsDisplay
