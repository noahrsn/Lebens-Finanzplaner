import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function fmt(n) {
  return (n ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/financial-profile', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
        <p className="text-sm text-slate-500 mt-1">Überblick über Ihre Finanzen</p>
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
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{goal.titel}</span>
                    <span className="text-slate-400 text-xs">
                      {fmt(goal.aktueller_fortschritt)}€ / {fmt(goal.zielbetrag)}€
                      <span className="ml-2 text-slate-500 font-medium">{pct}%</span>
                    </span>
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
    </div>
  )
}
