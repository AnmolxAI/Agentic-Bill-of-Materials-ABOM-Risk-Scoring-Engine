import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ResultsDisplay from './components/ResultsDisplay'
import HowItWorks from './components/HowItWorks'

function App() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleFileUpload = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/calculate-risk', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to calculate risk score')
      }

      const data = await response.json()
      setResult(data)
      setUploadedFile(file)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!uploadedFile) return

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch('http://localhost:8000/api/download-report', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate report')
      }

      const reportData = await response.json()
      const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(reportBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'abom_risk_report.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            ABOM Risk Scoring Engine
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Unified Agentic Risk Tiering for AI Governance
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Upload an ABOM.json to calculate risk score and UART tier classification
          </p>
        </header>

        {/* Upload Card */}
        <div className="card p-6 mb-6 fade-in">
          <FileUpload
            onFileUpload={handleFileUpload}
            loading={loading}
          />
        </div>

        {/* How It Works - expandable documentation */}
        <HowItWorks />

        {/* Error Display */}
        {error && (
          <div className="warning-banner mb-6 fade-in">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="card p-6 fade-in">
            <ResultsDisplay
              result={result}
              onDownloadReport={handleDownloadReport}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-10 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Based on "Technical AI Governance via an Agentic Bill of Materials and Risk Tiering"
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Risk Formula: R = A × U × e<sup>P</sup> × scaffolding_modifier
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
