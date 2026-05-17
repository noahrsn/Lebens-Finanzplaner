import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// --- static data (will come from API later) ---
const kpis = [
  {
    label: 'Einkommen',
    value: '3.500€',
    trend: '+12% zum Vormonat',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Ausgaben',
    value: '2.100€',
    trend: '-5% zum Vormonat',
    positive: false,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 7 9 13 13 9 21 17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Erspartes',
    value: '1.400€',
    trend: '+40% Sparquote',
    positive: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const chartData = [
  { name: 'Einkommen', value: 3500 },
  { name: 'Ausgaben',  value: 2100 },
  { name: 'Erspartes', value: 1400 },
]

const goals = [
  { label: 'Notfallfonds',  current: 5000,  target: 10000 },
  { label: 'Urlaub 2026',   current: 1500,  target: 3000  },
  { label: 'Neue Möbel',    current: 800,   target: 2000  },
  { label: 'Auto Anzahlung',current: 3200,  target: 8000  },
]

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Überblick über Ihre Finanzen</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 flex justify-between items-start shadow-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className={`text-xs mt-2 font-medium ${kpi.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.positive ? '↗' : '↘'} {kpi.trend}
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
            <Tooltip
              formatter={(v) => [`${v.toLocaleString('de-DE')}€`, '']}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal progress bars */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Finanzielle Ziele</h2>
        <div className="space-y-5">
          {goals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100)
            return (
              <div key={goal.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{goal.label}</span>
                  <span className="text-slate-400 text-xs">
                    {goal.current.toLocaleString('de-DE')}€ / {goal.target.toLocaleString('de-DE')}€
                    <span className="ml-2 text-slate-500 font-medium">{pct}%</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
