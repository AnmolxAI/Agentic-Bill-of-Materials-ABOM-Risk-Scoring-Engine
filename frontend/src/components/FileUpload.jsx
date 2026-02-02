import { useCallback, useState } from 'react'

function FileUpload({ onFileUpload, loading }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') {
      onFileUpload(file)
    } else {
      alert('Please upload a JSON file')
    }
  }, [onFileUpload])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        Upload ABOM Configuration
      </h2>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
          backgroundColor: isDragging ? 'var(--tier-0-bg)' : 'var(--color-bg-subtle)',
          borderRadius: '8px',
          padding: '2.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <div
              className="animate-spin rounded-full h-10 w-10 mb-3"
              style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing ABOM...</p>
          </div>
        ) : (
          <>
            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--tier-0-bg)',
                borderRadius: '50%'
              }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: 'var(--color-accent)' }}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <label
                htmlFor="file-upload"
                className="btn-primary"
                style={{ display: 'inline-block', cursor: 'pointer' }}
              >
                Select ABOM.json
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </label>
              <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                or drag and drop your file here
              </p>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Accepts JSON files following the ABOM schema
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload
