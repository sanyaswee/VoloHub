import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPing = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/ping')
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPing()
  }, [])

  return (
    <>
      <div>
        <h1>API Ping Test</h1>
        <button onClick={fetchPing} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Ping'}
        </button>
      </div>
      <div className="card">
        {error && (
          <div style={{ color: 'red' }}>
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
        {response && (
          <div>
            <h3>Response from /api/ping:</h3>
            <pre style={{ textAlign: 'left', background: '#1a1a1a', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App
