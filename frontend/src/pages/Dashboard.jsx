import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function fmt(n) {
  return (n ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editGoal, setEditGoal] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(API_URL + '/api/financial-profile', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDeleteGoal(id) {
    if (!window.confirm('Dieses Ziel wirklich löschen?')) return
    const res = await fetch(API_URL + '/api/financial-profile/goals/' + id, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      setProfile(p => ({ ...p, ziele_und_wuensche: (p.ziele_und_wuensche || []).filter(g => g.id !== id) }))
    }
  }

  async function handleSaveGoal() {
    setSaving(true)
    try {
      const res = await fetch(API_URL + '/api/financial-profile/goals/' + editGoal.id, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: editGoal.titel,
          zielbetrag: parseFloat(editGoal.zielbetrag),
          aktueller_fortschritt: parseFloat(editGoal.aktueller_fortschritt),
          zieldatum_jahr: parseInt(editGoal.zieldatum_jahr),
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        setProfile(p => ({ ...p, ziele_und_wuensche: (p.ziele_und_wuensche || []).map(g => g.id === saved.id ? saved : g) }))
        setEditGoal(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const ea      = profile?.einnahmen_und_ausgaben ?? {}
  const einkommen = ea.monatliches_netto_gehalt ?? 0
  const ausgaben  = (ea.monatliche_fixkosten ?? 0) + (ea.monatliche_variable_ausgaben ?? 0)
  const erspartes = ea.sparraten?.gesamt_monatlich ?? 0
  const sparquote = einkommen > 0 ? Math.round((erspartes / einkommen) * 100) : 0

  const chartData = [
    { name: 'Einkommen', value: einkommen },
    { name: 'Ausgaben',  value: ausgaben  },
    { name: 'Erspartes', value: erspartes },
  ]

  const ziele = profile?.ziele_und_wuensche ?? []

  const kpis = [
    {
      label: 'Einkommen',
      value: `${fmt(einkommen)}€`,
      sub: 'Netto-Gehalt / Monat',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Ausgaben',
      value: `${fmt(ausgaben)}€`,
      sub: `Fix ${fmt(ea.monatliche_fixkosten ?? 0)}€ + Variabel ${fmt(ea.monatliche_variable_ausgaben ?? 0)}€`,
      positive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 7 9 13 13 9 21 17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Erspartes',
      value: `${fmt(erspartes)}€`,
      sub: `${sparquote}% Sparquote`,
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-slate-400 text-sm">Laden...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Überblick über deine Finanzen</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 flex justify-between items-start shadow-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className={`text-xs mt-2 font-medium ${kpi.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.sub}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${kpi.positive ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Finanzübersicht</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={120}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={() => null} cursor={false} />
            <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Finanzielle Ziele</h2>
        {ziele.length === 0 ? (
          <p className="text-sm text-slate-400">Noch keine Ziele angelegt.</p>
        ) : (
          <div className="space-y-5">
            {ziele.map((goal, i) => {
              const pct = goal.zielbetrag > 0
                ? Math.min(100, Math.round((goal.aktueller_fortschritt / goal.zielbetrag) * 100))
                : 0
              return (
                <div key={goal.id ?? i}>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{goal.titel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs">
                        {fmt(goal.aktueller_fortschritt)}€ / {fmt(goal.zielbetrag)}€
                        <span className="ml-2 text-slate-500 font-medium">{pct}%</span>
                      </span>
                      <button
                        onClick={() => setEditGoal({ ...goal })}
                        title="Bearbeiten"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Löschen"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit goal modal */}
      {editGoal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Ziel bearbeiten</h3>
              <button onClick={() => setEditGoal(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Zielname', key: 'titel', type: 'text' },
                { label: 'Aktueller Betrag (€)', key: 'aktueller_fortschritt', type: 'number' },
                { label: 'Zielbetrag (€)', key: 'zielbetrag', type: 'number' },
                { label: 'Ziel-Jahr', key: 'zieldatum_jahr', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={editGoal[f.key] ?? ''}
                    onChange={e => setEditGoal(g => ({ ...g, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditGoal(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveGoal}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {saving ? 'Speichern…' : 'Änderungen speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
