import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Reset-Link konnte nicht angefordert werden.')
      } else {
        setMessage(data.message || 'Wenn die E-Mail registriert ist, wurde ein Reset-Link versendet.')
      }
    } catch (err) {
      setError('Server nicht erreichbar. Bitte versuche es später.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-slate-800/60"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-900/40"></div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">FinanzPlaner</h1>
            <p className="text-xs text-slate-400">Lebensplanung</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Zurück ins Konto.<br />
            Ohne Stress.
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Fordere einen sicheren Link an und lege danach ein neues Passwort fest.
          </p>
        </div>

        <div className="relative text-sm text-slate-400">
          Der Link ist zeitlich begrenzt und nur einmal sinnvoll nutzbar.
        </div>
      </div>

      <div className="flex-1 bg-stone-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Passwort vergessen?</h2>
          <p className="text-slate-500 mb-8">Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten.</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wider mb-2">
                E-MAIL-ADRESSE
              </label>
              <input
                name="email"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Passwort wieder eingefallen?{' '}
            <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
