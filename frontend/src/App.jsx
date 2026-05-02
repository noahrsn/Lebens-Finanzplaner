function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FinanzPlaner</h1>
            <p className="text-xs text-slate-500">Lebensplanung</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tailwind funktioniert ✓
        </h2>
        <p className="text-slate-600 mb-6">
          Wenn du diese Karte schön gestyled siehst, ist alles bereit.
        </p>
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors">
          Los geht's
        </button>
      </div>
    </div>
  )
}

export default App
