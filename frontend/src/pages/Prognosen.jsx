import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const kpiIcons = {
  "bg-emerald-50": (
    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "bg-cyan-50": (
    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" strokeLinecap="round" />
    </svg>
  ),
  "bg-amber-50": (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  ),
  "bg-purple-50": (
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
};

export default function Prognosen() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/prognosen', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden der Prognosedaten')
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8 text-slate-500">Lade Prognosen...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prognosen</h1>
        <p className="text-sm text-slate-500 mt-1">Finanzielle Vorhersagen und Trends basierend auf deinen Daten</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${k.iconBg} flex items-center justify-center mb-4`}>
              {kpiIcons[k.iconBg]}
            </div>
            <p className="text-xs text-slate-500 mb-2">{k.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{k.value}</span>
              <span className="text-xs text-slate-400 font-medium">{k.tag}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly area chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Cashflow Übersicht</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.monthlyData}>
            <defs>
              <linearGradient id="gradEinkommen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip formatter={(v, name) => [`${v.toLocaleString('de-DE')}€`, name]} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Area
              type="monotone" dataKey="Einkommen"
              stroke="#10b981" strokeWidth={2}
              fill="url(#gradEinkommen)"
            />
            <Line type="monotone" dataKey="Ausgaben"  stroke="#f87171" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Erspartes" stroke="#34d399" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wealth growth line chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Vermögenswachstum (10 Jahre)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.wealthData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v.toLocaleString('de-DE')}€`, 'Vermögen']} />
            <Line
              type="monotone" dataKey="Vermögen"
              stroke="#8b5cf6" strokeWidth={2.5}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
