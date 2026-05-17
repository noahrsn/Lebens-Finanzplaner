import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const schnellSzenarien = [
  {
    label: 'Gehaltserhöhung',
    desc: 'Was wäre, wenn Sie 10% mehr verdienen würden?',
    monat: '+350€/Monat',
    jahr: '+4.200€/Jahr',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" />
        <path d="M12 12v4M10 14h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Nebeneinkommen',
    desc: 'Zusätzliche 500€ monatlich durch Freelancing',
    monat: '+500€/Monat',
    jahr: '+6.000€/Jahr',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Ausgaben reduzieren',
    desc: 'Monatliche Ausgaben um 15% senken',
    monat: '+315€/Monat',
    jahr: '+3.780€/Jahr',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

const initialGoals = [
  { id: 1, label: 'Notfallfonds',   current: 5000,  target: 10000 },
  { id: 2, label: 'Urlaub 2026',    current: 1500,  target: 3000  },
  { id: 3, label: 'Neue Möbel',     current: 800,   target: 2000  },
  { id: 4, label: 'Auto Anzahlung', current: 3200,  target: 8000  },
]

function Slider({ label, value, min, max, step, format, onChange }) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-1">
        {label}: <span className="font-semibold text-slate-900">{format(value)}</span>
      </p>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-slate-900"
      />
    </div>
  )
}

export default function FinanzSzenarien() {
  const [tab, setTab] = useState('szenarien')

  // Slider state
  const [income,      setIncome]      = useState(3500)
  const [expenses,    setExpenses]    = useState(2100)
  const [savingsRate, setSavingsRate] = useState(40)
  const [rendite,     setRendite]     = useState(5)

  // Goals state
  const [goals, setGoals] = useState(initialGoals)
  const [goalModal, setGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({ label: '', current: '', target: '' })

  // Derived calculations
  const currentSaving   = Math.max(0, income - expenses)
  const optimizedSaving = Math.round(income * (savingsRate / 100))
  const monthlyRate     = rendite / 100 / 12

  const fv = (pmt, r, n) =>
    r > 0 ? Math.round(pmt * ((Math.pow(1 + r, n) - 1) / r)) : pmt * n

  const after5years = fv(optimizedSaving, monthlyRate, 60)

  const chartData = useMemo(() => (
    Array.from({ length: 61 }, (_, i) => ({
      m: i,
      Aktuell:          currentSaving * i,
      'Mit Investition': fv(currentSaving, monthlyRate, i),
      Optimiert:         fv(optimizedSaving, monthlyRate, i),
    }))
  ), [currentSaving, optimizedSaving, monthlyRate])

  function addGoal() {
    const cur = parseFloat(newGoal.current)
    const tgt = parseFloat(newGoal.target)
    if (!newGoal.label || isNaN(cur) || isNaN(tgt) || tgt <= 0) return
    setGoals(g => [...g, { id: Date.now(), label: newGoal.label, current: cur, target: tgt }])
    setNewGoal({ label: '', current: '', target: '' })
    setGoalModal(false)
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finanz Szenarien & Ziele</h1>
        <p className="text-sm text-slate-500 mt-1">Simulieren Sie verschiedene finanzielle Szenarien und verwalten Sie Ihre Ziele</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
        {['szenarien', 'ziele'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'szenarien' ? 'Szenarien' : 'Ziele'}
          </button>
        ))}
      </div>

      {/* ── SZENARIEN TAB ── */}
      {tab === 'szenarien' && (
        <div className="space-y-6">

          {/* Simulator sliders */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Szenario Simulator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              <Slider
                label="Monatliches Einkommen"
                value={income} min={500} max={10000} step={50}
                format={v => `${v.toLocaleString('de-DE')}€`}
                onChange={setIncome}
              />
              <Slider
                label="Sparquote"
                value={savingsRate} min={0} max={80} step={1}
                format={v => `${v}%`}
                onChange={setSavingsRate}
              />
              <Slider
                label="Monatliche Ausgaben"
                value={expenses} min={200} max={8000} step={50}
                format={v => `${v.toLocaleString('de-DE')}€`}
                onChange={setExpenses}
              />
              <Slider
                label="Erwartete Rendite"
                value={rendite} min={0} max={15} step={0.5}
                format={v => `${v}%`}
                onChange={setRendite}
              />
            </div>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-5">
              <p className="text-xs text-slate-500 mb-3">Aktuelles Sparen</p>
              <p className="text-3xl font-bold text-slate-900">{currentSaving.toLocaleString('de-DE')}€</p>
              <p className="text-xs text-slate-400 mt-2">pro Monat</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-5">
              <p className="text-xs text-slate-500 mb-3">Optimiertes Sparen</p>
              <p className="text-3xl font-bold text-slate-900">{optimizedSaving.toLocaleString('de-DE')}€</p>
              <p className="text-xs text-slate-400 mt-2">pro Monat</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-5">
              <p className="text-xs text-slate-500 mb-3">Nach 5 Jahren</p>
              <p className="text-3xl font-bold text-slate-900">{after5years.toLocaleString('de-DE')}€</p>
              <p className="text-xs text-slate-400 mt-2">mit Investition</p>
            </div>
          </div>

          {/* Line chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="m"
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Monate', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 12 }}
                  height={40}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v, name) => [`${v.toLocaleString('de-DE')}€`, name]} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="Aktuell"          stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Mit Investition"  stroke="#818cf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Optimiert"        stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Schnell-Szenarien */}
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Schnell-Szenarien</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {schnellSzenarien.map(s => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} ${s.iconColor} flex items-center justify-center mb-4`}>
                    {s.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">{s.label}</p>
                  <p className="text-xs text-slate-400 mb-4">{s.desc}</p>
                  <p className="text-emerald-500 font-semibold text-sm">{s.monat}</p>
                  <p className="text-emerald-500 text-xs mt-0.5">{s.jahr}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ZIELE TAB ── */}
      {tab === 'ziele' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setGoalModal(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <span className="text-lg leading-none">+</span> Neues Ziel
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
            {goals.map(goal => {
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{goal.label}</span>
                    <span className="text-slate-400 text-xs">
                      {goal.current.toLocaleString('de-DE')}€ / {goal.target.toLocaleString('de-DE')}€
                      <span className="ml-2 font-medium text-slate-500">{pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add goal modal */}
          {goalModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900">Neues Ziel hinzufügen</h3>
                  <button onClick={() => setGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Zielname', key: 'label', placeholder: 'z.B. Urlaub 2027', type: 'text' },
                    { label: 'Aktueller Betrag (€)', key: 'current', placeholder: '0', type: 'number' },
                    { label: 'Zielbetrag (€)', key: 'target', placeholder: '5000', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm font-medium text-slate-700 block mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={newGoal[f.key]}
                        onChange={e => setNewGoal(g => ({ ...g, [f.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setGoalModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={addGoal}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold"
                  >
                    Ziel speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
