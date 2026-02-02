function ResultsDisplay({ result, onDownloadReport }) {
  const getTierColor = (tier) => {
    const colors = {
      0: 'bg-green-100 text-green-800 border-green-300',
      1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      2: 'bg-orange-100 text-orange-800 border-orange-300',
      3: 'bg-red-100 text-red-800 border-red-300',
      4: 'bg-red-200 text-red-900 border-red-400',
    }
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getTierDescription = (tier) => {
    const descriptions = {
      0: 'Minimal Risk',
      1: 'Low Risk',
      2: 'Moderate Risk',
      3: 'High Risk',
      4: 'Critical Risk',
    }
    return descriptions[tier] || 'Unknown'
  }

  const getAgencyLabel = (agency) => {
    const labels = {
      1: 'No tools',
      2: 'Read-only tools',
      4: 'State-changing tools',
    }
    return labels[agency] || 'Unknown'
  }

  const getAutonomyLabel = (autonomy) => {
    const labels = {
      1: 'HITL (Human-In-The-Loop)',
      2: 'HOTL (Human-On-The-Loop)',
      3: 'HOOTL (Human-Out-Of-The-Loop)',
    }
    return labels[autonomy] || 'Unknown'
  }

  const getPersistenceLabel = (persistence) => {
    const labels = {
      0: 'None or ephemeral',
      1: 'Session-only',
      2: 'Cross-session or long-term',
    }
    return labels[persistence] || 'Unknown'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment Results</h2>

      {/* Main Score Display */}
      <div className="mb-6">
        <div className={`rounded-lg border-2 p-6 ${getTierColor(result.tier)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Risk Score</p>
              <p className="text-4xl font-bold mt-1">{result.score}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-75">UART Tier</p>
              <p className="text-4xl font-bold mt-1">Tier {result.tier}</p>
              <p className="text-sm mt-1 opacity-75">{getTierDescription(result.tier)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Agency (A)</p>
            <p className="text-2xl font-bold text-gray-900">{result.agency}</p>
            <p className="text-xs text-gray-500 mt-1">{getAgencyLabel(result.agency)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Autonomy (U)</p>
            <p className="text-2xl font-bold text-gray-900">{result.autonomy}</p>
            <p className="text-xs text-gray-500 mt-1">{getAutonomyLabel(result.autonomy)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Persistence (P)</p>
            <p className="text-2xl font-bold text-gray-900">{result.persistence}</p>
            <p className="text-xs text-gray-500 mt-1">{getPersistenceLabel(result.persistence)}</p>
          </div>
        </div>
      </div>

      {/* Formula Display */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm font-medium text-blue-900 mb-1">Risk Score Formula</p>
        <p className="text-lg font-mono text-blue-800">
          R = A × U × e<sup>P</sup>
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Calculated: {result.agency} × {result.autonomy} × e<sup>{result.persistence}</sup> = {result.score}
        </p>
      </div>

      {/* JSON Output */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Result Data</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={onDownloadReport}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Report (JSON)
        </button>
      </div>
    </div>
  )
}

export default ResultsDisplay

