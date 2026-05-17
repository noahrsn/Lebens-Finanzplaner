import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  // null  = still checking (show loading)
  // true  = logged in (show the page)
  // false = not logged in (redirect to login)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    // Ask Flask if there is an active session
    fetch('http://localhost:5000/api/me', {
      credentials: 'include', // send the session cookie with the request
    })
      .then(res => setStatus(res.ok))   // ok = 200 (logged in), not ok = 401
      .catch(() => setStatus(false))    // network error → treat as not logged in
  }, [])

  // Still waiting for the server response — show nothing yet
  if (status === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-400 text-sm">Laden...</div>
      </div>
    )
  }

  // Not logged in → redirect to login page
  if (status === false) {
    return <Navigate to="/" replace />
  }

  // Logged in → show the actual page
  return children
}
