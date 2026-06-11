import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    sectionKey: 'einnahmen_und_ausgaben',
    title: '💰 Einnahmen & Ausgaben',
    fields: [
      { path: 'monatliches_netto_gehalt',     label: 'Monatliches Netto-Gehalt',        unit: '€' },
      { path: 'monatliche_fixkosten',         label: 'Monatliche Fixkosten',             unit: '€' },
      { path: 'monatliche_variable_ausgaben', label: 'Monatliche Variable Ausgaben',     unit: '€' },
      { path: 'sparraten.gesamt_monatlich',   label: 'Sparrate gesamt / Monat',          unit: '€' },
      { path: 'sparraten.aufteilung.depot',   label: 'Sparrate Depot',                   unit: '€' },
      { path: 'sparraten.aufteilung.tagesgeld', label: 'Sparrate Tagesgeld',             unit: '€' },
    ],
  },
  {
    sectionKey: 'altersvorsorge',
    title: '🏦 Altersvorsorge',
    fields: [
      { path: 'geplantes_renteneintrittsalter',      label: 'Renteneintrittsalter',                    unit: 'Jahre' },
      { path: 'aktuelle_rentenpunkte',               label: 'Aktuelle Rentenpunkte' },
      { path: 'erwartete_rentenpunkte_bei_eintritt', label: 'Erwartete Rentenpunkte bei Eintritt' },
    ],
  },
  {
    sectionKey: 'konten_und_vermoegenswerte',
    title: '📊 Konten & Vermögenswerte',
    fields: [
      { path: 'girokonto_stand',             label: 'Girokonto',              unit: '€' },
      { path: 'tagesgeld_stand',             label: 'Tagesgeld',              unit: '€' },
      { path: 'ruecklagen',                  label: 'Rücklagen',              unit: '€' },
      { path: 'depot_wertpapiere',           label: 'Depot / Wertpapiere',    unit: '€' },
      { path: 'versicherungsvertraege_wert', label: 'Versicherungsverträge',  unit: '€' },
    ],
  },
]

function getIn(obj, path) {
  return path.split('.').reduce((acc, k) => acc?.[k], obj)
}

function setIn(obj, path, value) {
  const keys = path.split('.')
  const clone = JSON.parse(JSON.stringify(obj))
  let cur = clone
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = parseFloat(value) || 0
  return clone
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function MeineFinanzen() {
  const [profile, setProfile]     = useState(null)
  const [draft, setDraft]         = useState(null)
  const [editingKey, setEditingKey] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/financial-profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setDraft(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Profil konnte nicht geladen werden.')
        setLoading(false)
      })
  }, [])

  function startEdit(sectionKey, fieldPath) {
    setEditingKey(`${sectionKey}.${fieldPath}`)
  }

  function handleFieldChange(sectionKey, fieldPath, value) {
    setDraft(prev => ({
      ...prev,
      [sectionKey]: setIn(prev[sectionKey], fieldPath, value),
    }))
  }

  function stopEdit() {
    setEditingKey(null)
  }

  const hasChanges = profile && draft && JSON.stringify(profile) !== JSON.stringify(draft)

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const updatedSections = {}
    for (const { sectionKey } of SECTIONS) {
      updatedSections[sectionKey] = draft[sectionKey]
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/financial-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedSections),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Speichern.')
      } else {
        setProfile(data)
        setDraft(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Server nicht erreichbar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-slate-400 text-sm">Profil wird geladen...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="px-4 py-8 sm:px-8 max-w-3xl mx-auto w-full">
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-8 space-y-6 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mein Finanzprofil</h1>
        <p className="text-sm text-slate-500 mt-1">Klicke auf Bearbeiten um einen Wert zu ändern.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      {saved && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-lg">
          Profil erfolgreich gespeichert.
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map(({ sectionKey, title, fields }) => (
        <div key={sectionKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">{title}</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {fields.map(({ path, label, unit }) => {
              const fieldId = `${sectionKey}.${path}`
              const isEditing = editingKey === fieldId
              const currentValue = getIn(draft?.[sectionKey], path)

              return (
                <div key={path} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 gap-2 sm:gap-4">
                  <span className="text-sm text-slate-500 sm:w-64 shrink-0">{label}</span>

                  <div className="flex items-center justify-between sm:justify-end sm:flex-1 gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            autoFocus
                            value={currentValue ?? ''}
                            onChange={e => handleFieldChange(sectionKey, path, e.target.value)}
                            onBlur={stopEdit}
                            onKeyDown={e => e.key === 'Enter' && stopEdit()}
                            className="w-36 px-3 py-1.5 pr-8 border border-emerald-400 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          {unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{unit}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-800">
                        {typeof currentValue === 'number'
                          ? currentValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : currentValue ?? '—'}
                        {unit && <span className="text-slate-400 font-normal ml-1">{unit}</span>}
                      </span>
                    )}

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(sectionKey, path)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-400 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <EditIcon />
                        Bearbeiten
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div className="pb-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
        >
          {saving ? 'Wird gespeichert...' : hasChanges ? 'Änderungen speichern' : 'Keine Änderungen'}
        </button>
      </div>

    </div>
  )
}
