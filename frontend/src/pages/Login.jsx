function Login() {
  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT SIDE — dark navy panel (hidden on mobile) ===== */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* decorative background circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-slate-800/60"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-900/40"></div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline
                points="3 17 9 11 13 15 21 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">FinanzPlaner</h1>
            <p className="text-xs text-slate-400">Lebensplanung</p>
          </div>
        </div>

        {/* Tagline */}
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

        {/* Stats row */}
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

      {/* ===== RIGHT SIDE — login form ===== */}
      <div className="flex-1 bg-stone-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Willkommen zurück
          </h2>
          <p className="text-slate-500 mb-8">
            Melde dich an, um weiterzumachen.
          </p>

          <form className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-500 tracking-wider mb-2"
              >
                E-MAIL-ADRESSE
              </label>
              <input
                id="email"
                type="email"
                placeholder="deine@email.de"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-500 tracking-wider"
                >
                  PASSWORT
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Vergessen?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Mindestens 6 Zeichen"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Anmelden
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Noch kein Konto?{' '}
            <a
              href="#"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Jetzt registrieren
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
