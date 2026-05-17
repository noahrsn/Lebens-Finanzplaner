import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  // useNavigate lets us redirect the user after successful registration
  const navigate = useNavigate()

  // One state object for all form fields
  const [form, setForm] = useState({
    vorname: '', nachname: '', email: '', password: ''
  })

  // error = red message shown under the form
  // success = green message shown when registration works
  // loading = true while waiting for the server response
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Called on every keystroke — updates only the field that changed
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Send the form data as JSON to the Flask backend
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        // Server returned an error (e.g. email already taken)
        setError(data.error)
      } else {
        // Registration worked — show success then go to login
        setSuccess('Konto erfolgreich erstellt! Du wirst weitergeleitet...')
        setTimeout(() => navigate('/'), 2000)
      }
    } catch (err) {
      // Network error — Flask server probably not running
      setError('Server nicht erreichbar. Bitte versuche es später.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT SIDE ===== */}
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
            Deine Finanzen.<br />
            Dein Leben.<br />
            <span className="text-emerald-500">Geplant.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Vermögensprojektionen, Ziel-Tracking und KI-Beratung — alles in einer Übersicht.
          </p>
        </div>

        <div className="relative flex gap-12">
          <div>
            <div className="text-2xl font-bold text-emerald-500">30+</div>
            <div className="text-xs text-slate-400">Jahre Prognose</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">4</div>
            <div className="text-xs text-slate-400">Szenarien</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">KI</div>
            <div className="text-xs text-slate-400">Assistent</div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex-1 bg-stone-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Konto erstellen</h2>
          <p className="text-slate-500 mb-8">Erstelle dein kostenloses Konto.</p>

          {/* Error message — only shown when error is not empty */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vorname + Nachname */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wider mb-2">
                  VORNAME
                </label>
                <input
                  name="vorname"
                  type="text"
                  placeholder="Max"
                  value={form.vorname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wider mb-2">
                  NACHNAME
                </label>
                <input
                  name="nachname"
                  type="text"
                  placeholder="Mustermann"
                  value={form.nachname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wider mb-2">
                E-MAIL-ADRESSE
              </label>
              <input
                name="email"
                type="email"
                placeholder="deine@email.de"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wider mb-2">
                PASSWORT
              </label>
              <input
                name="password"
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Submit button — shows "Lädt..." while waiting */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Wird gespeichert...' : 'Registrieren'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Bereits ein Konto?{' '}
            <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
