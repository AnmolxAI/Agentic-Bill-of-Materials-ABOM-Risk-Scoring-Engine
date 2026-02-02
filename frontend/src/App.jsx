import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ResultsDisplay from './components/ResultsDisplay'

function App() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [abomData, setAbomData] = useState(null)
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

      // Store the file for download report
      setUploadedFile(file)
      
      // Also read the file to display it
      const fileContent = await file.text()
      setAbomData(JSON.parse(fileContent))
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ABOM Risk Scoring Engine
          </h1>
          <p className="text-gray-600">
            Upload an ABOM.json file to calculate risk score and UART tier classification
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <FileUpload
            onFileUpload={handleFileUpload}
            loading={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ResultsDisplay
              result={result}
              onDownloadReport={handleDownloadReport}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

