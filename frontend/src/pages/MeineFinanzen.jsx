import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

const categoryData = [
  { name: 'Wohnen',         value: 66, color: '#10b981' },
  { name: 'Essen & Trinken',value: 11, color: '#34d399' },
  { name: 'Shopping',       value:  8, color: '#f472b6' },
  { name: 'Nebenkosten',    value:  6, color: '#fb923c' },
  { name: 'Transport',      value:  5, color: '#60a5fa' },
  { name: 'Gesundheit',     value:  2, color: '#f87171' },
  { name: 'Unterhaltung',   value:  1, color: '#facc15' },
]

const transactions = [
  { id: 1, name: 'Gehalt',       date: '2026-05-01', category: 'Einkommen',      amount: 3500,  income: true  },
  { id: 2, name: 'Miete',        date: '2026-05-01', category: 'Wohnen',         amount: -950,  income: false },
  { id: 3, name: 'Lebensmittel', date: '2026-04-30', category: 'Essen & Trinken',amount: -120,  income: false },
  { id: 4, name: 'Netflix',      date: '2026-04-28', category: 'Unterhaltung',   amount: -13,   income: false },
  { id: 5, name: 'Apotheke',     date: '2026-04-27', category: 'Gesundheit',     amount: -28,   income: false },
  { id: 6, name: 'Zalando',      date: '2026-04-25', category: 'Shopping',       amount: -115,  income: false },
  { id: 7, name: 'Strom',        date: '2026-04-24', category: 'Nebenkosten',    amount: -85,   income: false },
  { id: 8, name: 'BVG Ticket',   date: '2026-04-22', category: 'Transport',      amount: -86,   income: false },
  { id: 9, name: 'Nebenjob',     date: '2026-04-20', category: 'Einkommen',      amount: 450,   income: true  },
]

const categoryColors = Object.fromEntries(categoryData.map(c => [c.name, c.color]))
categoryColors['Einkommen'] = '#10b981'

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RAD = Math.PI / 180
  const r = outerRadius + 30
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return (
    <text x={x} y={y} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} fontSize={12}>
      {name} {value}%
    </text>
  )
}

function IncomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 7 17 7 17 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExpenseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="17 7 7 17" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 17 7 17 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const emptyForm = { type: 'income', title: '', amount: '', category: '' }

export default function MeineFinanzen() {
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [search, setSearch] = useState('')
  const [list, setList] = useState(transactions)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const totalIncome  = list.filter(t => t.income).reduce((s, t) => s + t.amount, 0)
  const totalExpense = list.filter(t => !t.income).reduce((s, t) => s + Math.abs(t.amount), 0)

  function openModal() { setForm(emptyForm); setModalOpen(true) }
  function closeModal() { setModalOpen(false) }

  function saveTransaction() {
    const amt = parseFloat(form.amount)
    if (!form.title || isNaN(amt) || amt <= 0) return
    const isIncome = form.type === 'income'
    const newItem = {
      id: Date.now(),
      name: form.title,
      date: new Date().toISOString().slice(0, 10),
      category: form.category || (isIncome ? 'Einkommen' : 'Sonstiges'),
      amount: isIncome ? amt : -amt,
      income: isIncome,
    }
    setList(prev => [newItem, ...prev])
    closeModal()
  }

  const filtered = list.filter(t => {
    const matchFilter =
      activeFilter === 'Alle' ||
      (activeFilter === 'Einnahmen' && t.income) ||
      (activeFilter === 'Ausgaben' && !t.income)
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meine Finanzen</h1>
          <p className="text-sm text-slate-500 mt-1">Verwalten Sie Ihre Einnahmen und Ausgaben</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span> Transaktion hinzufügen
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 mb-3">Gesamteinkommen</p>
            <p className="text-3xl font-bold text-slate-900">{totalIncome.toLocaleString('de-DE')}€</p>
            <p className="text-xs text-slate-400 mt-2">Diesen Monat</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
            <IncomeIcon />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 mb-3">Gesamtausgaben</p>
            <p className="text-3xl font-bold text-slate-900">{totalExpense.toLocaleString('de-DE')}€</p>
            <p className="text-xs text-slate-400 mt-2">Diesen Monat</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 text-red-400">
            <ExpenseIcon />
          </div>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Ausgaben nach Kategorie</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              labelLine={true}
              label={renderCustomLabel}
            >
              {categoryData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">Transaktionen</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Suchen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-52"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {['Alle', 'Einnahmen', 'Ausgaben'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        <div className="space-y-1">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
              <div className={`p-2 rounded-lg shrink-0 ${t.income ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>
                {t.income ? <IncomeIcon /> : <ExpenseIcon />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{t.date}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: (categoryColors[t.category] ?? '#94a3b8') + '22',
                      color: categoryColors[t.category] ?? '#94a3b8',
                    }}
                  >
                    {t.category}
                  </span>
                </div>
              </div>
              <span className={`text-sm font-semibold shrink-0 ${t.income ? 'text-emerald-500' : 'text-red-500'}`}>
                {t.income ? '+' : ''}{t.amount.toLocaleString('de-DE')}€
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            {/* Modal header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Neue Transaktion hinzufügen</h3>
                <p className="text-sm text-slate-500 mt-0.5">Fügen Sie eine neue Einnahme oder Ausgabe hinzu.</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mt-5">
              {/* Type selection */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Transaktionstyp</p>
                <div className="space-y-2">
                  {[
                    { value: 'income',  label: 'Einkommen', sub: 'Gehalt, Bonus, etc.',   icon: <IncomeIcon />,  bg: 'bg-emerald-50 text-emerald-500' },
                    { value: 'expense', label: 'Ausgabe',   sub: 'Miete, Einkäufe, etc.', icon: <ExpenseIcon />, bg: 'bg-red-50 text-red-400' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
                        form.type === opt.value ? 'border-slate-900' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-slate-400 text-lg">
                        {form.type === opt.value ? '●' : '○'}
                      </span>
                      <div className={`p-1.5 rounded-lg ${opt.bg}`}>{opt.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Titel</label>
                <input
                  type="text"
                  placeholder="z.B. Gehalt"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Betrag (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kategorie (optional)</label>
                <input
                  type="text"
                  placeholder="z.B. Nebeneinkommen"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={saveTransaction}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
              >
                Transaktion speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
