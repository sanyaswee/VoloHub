import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchPing = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:8000/api/ping/')
    const data = await res
    setResponse(data)
    setLoading(false)
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
        {response && (
          <div>
            <h3>Response from api/ping/:</h3>
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
