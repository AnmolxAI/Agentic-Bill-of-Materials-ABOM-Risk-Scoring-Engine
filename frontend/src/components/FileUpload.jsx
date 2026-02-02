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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload ABOM.json File
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Processing...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span>Select a file</span>
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
              <p className="mt-2 text-sm text-gray-600">
                or drag and drop
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              JSON files only
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload

