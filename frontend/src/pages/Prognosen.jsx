import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceDot
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    titel: '',
    zielbetrag: '',
    aktueller_fortschritt: '',
    zieldatum_jahr: new Date().getFullYear() + 2
  })
  const [goalSubmitting, setGoalSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const loadData = () => {
    fetch(API_URL + '/api/prognosen', {
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
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetGoalForm = () => {
    setEditingId(null)
    setShowGoalForm(false)
    setNewGoal({ titel: '', zielbetrag: '', aktueller_fortschritt: '', zieldatum_jahr: new Date().getFullYear() + 2 })
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    setGoalSubmitting(true)
    try {
      const url = editingId
        ? API_URL + '/api/financial-profile/goals/' + editingId
        : API_URL + '/api/financial-profile/goals'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titel: newGoal.titel,
          zielbetrag: parseFloat(newGoal.zielbetrag),
          aktueller_fortschritt: parseFloat(newGoal.aktueller_fortschritt),
          zieldatum_jahr: parseInt(newGoal.zieldatum_jahr)
        })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fehler beim Speichern des Ziels')
      }

      loadData()
      resetGoalForm()
    } catch (err) {
      alert(err.message)
    } finally {
      setGoalSubmitting(false)
    }
  }

  const startEditGoal = (g) => {
    setEditingId(g.id)
    setNewGoal({
      titel: g.titel,
      zielbetrag: g.zielbetrag,
      aktueller_fortschritt: g.aktueller_fortschritt,
      zieldatum_jahr: g.zieldatum_jahr
    })
    setShowGoalForm(true)
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Dieses Ziel wirklich löschen?')) return
    try {
      const res = await fetch(API_URL + '/api/financial-profile/goals/' + id, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Fehler beim Löschen des Ziels')
      }
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Lade Prognosen...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prognosen</h1>
          <p className="text-sm text-slate-500 mt-1">Finanzielle Vorhersagen und Trends basierend auf deinen Daten</p>
        </div>
        <button
          onClick={() => showGoalForm ? resetGoalForm() : setShowGoalForm(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {showGoalForm ? 'Abbrechen' : '+ Neues Ziel'}
        </button>
      </div>

      {/* goal form */}
      {showGoalForm && (
        <form onSubmit={handleAddGoal} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 mb-4">{editingId ? 'Ziel bearbeiten' : 'Neues Ziel setzen'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">TITEL</label>
              <input required type="text" value={newGoal.titel} onChange={e => setNewGoal({...newGoal, titel: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800" placeholder="z.B. Weltreise" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ZIELBETRAG (€)</label>
              <input required type="number" min="0" step="100" value={newGoal.zielbetrag} onChange={e => setNewGoal({...newGoal, zielbetrag: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800" placeholder="10000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">BEREITS GESPART (€)</label>
              <input required type="number" min="0" step="100" value={newGoal.aktueller_fortschritt} onChange={e => setNewGoal({...newGoal, aktueller_fortschritt: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800" placeholder="2000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ZIEL-JAHR</label>
              <input required type="number" min={new Date().getFullYear()} value={newGoal.zieldatum_jahr} onChange={e => setNewGoal({...newGoal, zieldatum_jahr: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button disabled={goalSubmitting} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {goalSubmitting ? 'Wird gespeichert...' : 'Ziel speichern'}
            </button>
          </div>
        </form>
      )}

      {/* goals gist */}
      {data.goals && data.goals.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Deine Ziele</h2>
          <div className="space-y-4">
            {data.goals.map((g, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="mb-2 sm:mb-0">
                  <div className="font-semibold text-slate-800">{g.titel} <span className="text-xs font-normal text-slate-500 ml-2">bis {g.zieldatum_jahr}</span></div>
                  <div className="text-xs text-slate-500 mt-1">
                    {g.status === 'Unterstützt' ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Unterstützt durch Cashflow</span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">Gefährdet (Deckung: {Math.floor(g.deckungsgard_prozent)}%)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {g.aktueller_fortschritt.toLocaleString('de-DE')}€ <span className="text-slate-400">/ {g.zielbetrag.toLocaleString('de-DE')}€</span>
                    </div>
                    <div className="w-full sm:w-48 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${g.status === 'Unterstützt' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, (g.aktueller_fortschritt / g.zielbetrag) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditGoal(g)}
                      title="Bearbeiten"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      title="Löschen"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* monthly area chart */}
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

      {/* wealth growth line chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Vermögenswachstum (10 Jahre)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.wealthData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip formatter={(v, name) => [`${v.toLocaleString('de-DE')}€`, 'Vermögen']} />
            
            {data.goals && data.goals.map((g, idx) => {
              return (
                <ReferenceDot 
                  key={`goal-dot-${idx}`}
                  x={String(g.zieldatum_jahr)} 
                  y={g.zielbetrag} 
                  r={6} 
                  fill={g.status === 'Unterstützt' ? '#10b981' : '#f59e0b'} 
                  stroke="#fff" 
                  strokeWidth={2}
                />
              )
            })}

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
