import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const inputClass =
  'w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800'
const labelClass = 'block text-xs font-semibold text-slate-500 tracking-wider mb-2'

function Field({ label, name, value, onChange, type = 'number', unit, placeholder }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          name={name}
          type={type}
          step={type === 'number' ? '0.01' : undefined}
          min={type === 'number' ? '0' : undefined}
          placeholder={placeholder ?? '0'}
          value={value}
          onChange={onChange}
          required
          className={inputClass + (unit ? ' pr-10' : '')}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      {children}
    </div>
  )
}

export default function Eingabe() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({ vorname: '', nachname: '', email: '', geburtsdatum: '' })

  const [einnahmen, setEinnahmen] = useState({
    monatliches_netto_gehalt: '',
    monatliche_fixkosten: '',
    monatliche_variable_ausgaben: '',
    sparraten_gesamt: '',
    sparraten_depot: '',
    sparraten_tagesgeld: '',
  })

  const [altersvorsorge, setAltersvorsorge] = useState({
    geplantes_renteneintrittsalter: '',
    aktuelle_rentenpunkte: '',
    erwartete_rentenpunkte_bei_eintritt: '',
  })

  const [konten, setKonten] = useState({
    girokonto_stand: '',
    tagesgeld_stand: '',
    ruecklagen: '',
    depot_wertpapiere: '',
    versicherungsvertraege_wert: '',
  })

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setUser(d))
      .catch(() => {})
  }, [])

  function handleEinnahmen(e) {
    setEinnahmen(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  function handleAlters(e) {
    setAltersvorsorge(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  function handleKonten(e) {
    setKonten(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const profile = {
      benutzer: {
        email:        user.email,
        name:         user.nachname,
        vorname:      user.vorname,
        geburtsdatum: user.geburtsdatum,
      },
      einnahmen_und_ausgaben: {
        monatliches_netto_gehalt:      parseFloat(einnahmen.monatliches_netto_gehalt),
        monatliche_fixkosten:          parseFloat(einnahmen.monatliche_fixkosten),
        monatliche_variable_ausgaben:  parseFloat(einnahmen.monatliche_variable_ausgaben),
        sparraten: {
          gesamt_monatlich: parseFloat(einnahmen.sparraten_gesamt),
          aufteilung: {
            depot:      parseFloat(einnahmen.sparraten_depot),
            tagesgeld:  parseFloat(einnahmen.sparraten_tagesgeld),
          },
        },
      },
      altersvorsorge: {
        geplantes_renteneintrittsalter:       parseFloat(altersvorsorge.geplantes_renteneintrittsalter),
        aktuelle_rentenpunkte:                parseFloat(altersvorsorge.aktuelle_rentenpunkte),
        erwartete_rentenpunkte_bei_eintritt:  parseFloat(altersvorsorge.erwartete_rentenpunkte_bei_eintritt),
      },
      konten_und_vermoegenswerte: {
        girokonto_stand:             parseFloat(konten.girokonto_stand),
        tagesgeld_stand:             parseFloat(konten.tagesgeld_stand),
        ruecklagen:                  parseFloat(konten.ruecklagen),
        depot_wertpapiere:           parseFloat(konten.depot_wertpapiere),
        versicherungsvertraege_wert: parseFloat(konten.versicherungsvertraege_wert),
      },
      ziele_und_wuensche: [],
      szenarien_und_simulationen: {
        angenommene_inflation_prozent: 2.0,
        life_events: [],
      },
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/financial-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Speichern.')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Server nicht erreichbar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800">FinanzPlaner</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Dein Finanzprofil einrichten</h1>
          <p className="text-slate-500 mt-2">
            Hallo {user.vorname || ''}! Gib deine Finanzdaten ein, damit wir deine persönliche Prognose berechnen können.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Einnahmen & Ausgaben */}
          <SectionCard title="💰 Einnahmen & Ausgaben">
            <Field label="MONATLICHES NETTO-GEHALT" name="monatliches_netto_gehalt" value={einnahmen.monatliches_netto_gehalt} onChange={handleEinnahmen} unit="€" />
            <Field label="MONATLICHE FIXKOSTEN" name="monatliche_fixkosten" value={einnahmen.monatliche_fixkosten} onChange={handleEinnahmen} unit="€" placeholder="Miete, Versicherungen, ..." />
            <Field label="MONATLICHE VARIABLE AUSGABEN" name="monatliche_variable_ausgaben" value={einnahmen.monatliche_variable_ausgaben} onChange={handleEinnahmen} unit="€" placeholder="Lebensmittel, Freizeit, ..." />
            <div className="border-t border-slate-100 pt-4">
              <p className={labelClass}>SPARRATEN</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="GESAMT / MONAT" name="sparraten_gesamt" value={einnahmen.sparraten_gesamt} onChange={handleEinnahmen} unit="€" />
                <Field label="DAVON DEPOT" name="sparraten_depot" value={einnahmen.sparraten_depot} onChange={handleEinnahmen} unit="€" />
                <Field label="DAVON TAGESGELD" name="sparraten_tagesgeld" value={einnahmen.sparraten_tagesgeld} onChange={handleEinnahmen} unit="€" />
              </div>
            </div>
          </SectionCard>

          {/* Altersvorsorge */}
          <SectionCard title="🏦 Altersvorsorge">
            <Field label="GEPLANTES RENTENEINTRITTSALTER" name="geplantes_renteneintrittsalter" value={altersvorsorge.geplantes_renteneintrittsalter} onChange={handleAlters} unit="Jahre" placeholder="67" />
            <Field label="AKTUELLE RENTENPUNKTE" name="aktuelle_rentenpunkte" value={altersvorsorge.aktuelle_rentenpunkte} onChange={handleAlters} placeholder="z.B. 12.5" />
            <Field label="ERWARTETE RENTENPUNKTE BEI EINTRITT" name="erwartete_rentenpunkte_bei_eintritt" value={altersvorsorge.erwartete_rentenpunkte_bei_eintritt} onChange={handleAlters} placeholder="z.B. 45.0" />
          </SectionCard>

          {/* Konten & Vermögen */}
          <SectionCard title="📊 Konten & Vermögenswerte">
            <div className="grid grid-cols-2 gap-4">
              <Field label="GIROKONTO" name="girokonto_stand" value={konten.girokonto_stand} onChange={handleKonten} unit="€" placeholder="laufendes Konto" />
              <Field label="TAGESGELD" name="tagesgeld_stand" value={konten.tagesgeld_stand} onChange={handleKonten} unit="€" placeholder="Sparkonto mit Zinsen" />
              <Field label="RÜCKLAGEN" name="ruecklagen" value={konten.ruecklagen} onChange={handleKonten} unit="€" placeholder="Notfallreserve" />
              <Field label="DEPOT / WERTPAPIERE" name="depot_wertpapiere" value={konten.depot_wertpapiere} onChange={handleKonten} unit="€" placeholder="Aktien, ETFs, Fonds" />
              <Field label="VERSICHERUNGEN WERT" name="versicherungsvertraege_wert" value={konten.versicherungsvertraege_wert} onChange={handleKonten} unit="€" placeholder="z.B. Lebensversicherung" />
            </div>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base"
          >
            {loading ? 'Wird gespeichert...' : 'Berechnen'}
          </button>
        </form>
      </div>
    </div>
  )
}
