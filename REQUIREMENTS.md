# 📋 Anforderungsanalyse

## Legende

| Symbol | Priorität | Bedeutung |
|--------|-----------|-----------|
| 🔴 | **Must Have** | Ohne diese Funktion ist kein Launch möglich |
| 🟡 | **Should Have** | Wichtig für echten Nutzwert, kurzfristig verzichtbar |
| 🟢 | **Could Have** | Nice-to-have, klar vom Kern getrennt |
| ⚪ | **Won't Have (yet)** | Bewusst ausgeklammert für den ersten Release |

---

## 🔒 Nicht-funktionale Anforderungen

<details>
<summary><strong>Sicherheit</strong></summary>

- 🔴 Authentifizierung bei Anmeldung und Registrierung
- 🔴 Sichere Speicherung der Anmeldedaten (z. B. Passwort-Hashing via bcrypt)
- 🔴 Datenschutzkonforme Verarbeitung sensibler Finanzdaten (DSGVO)

</details>

<details>
<summary><strong>Datenhaltung & Infrastruktur</strong></summary>

- 🔴 Datenbankanbindung für Nutzerdaten-Speicherung
- 🟡 CI/CD Pipeline

</details>

<details>
<summary><strong>Usability</strong></summary>

- 🔴 Einfache und klare Benutzeroberfläche
- 🔴 Minimierung manueller Eingaben (kein übermäßiger Eingabeaufwand)
- 🟡 Gute Mischung aus präzisen Zahlen und Diagrammen
- 🟡 Vermeidung von Überforderung (Progressive Disclosure)

</details>

<details>
<summary><strong>Transparenz</strong></summary>

- 🟡 Nachvollziehbare Berechnungen und Empfehlungen (keine Black Box)

</details>

---

## ⚙️ Funktionale Anforderungen

<details>
<summary><strong>Nutzerverwaltung</strong></summary>

- 🔴 Registrierung und Benutzerkontoverwaltung
- 🔴 Anmeldung mit Authentifizierung

</details>

<details>
<summary><strong>Dateneingabe</strong></summary>

- 🔴 Eingabemaske für persönliche Finanzparameter
    - Gehalt, Kontostände (Tagesgeld, Girokonto), Depot, Ziele, Wünsche
- 🔴 Erfassung von Fixkosten und variablen Ausgaben
- 🟡 Angaben zu Vermögenswerten (Wertpapiere, Versicherungsverträge, Rücklagen)

</details>

<details>
<summary><strong>Dashboard</strong></summary>

- 🔴 Übersichtliches Dashboard mit Diagrammen und Kennzahlen

</details>

<details>
<summary><strong>Berechnungen & Prognosen</strong></summary>

- 🔴 Zukunftsberechnungen (Rente, Hauskauf, Mieten vs. Kaufen)
- 🟡 Langfristige Prognosen über 20–30 Jahre inkl. Inflation und Lebensveränderungen

</details>

<details>
<summary><strong>Ziel-Tracking</strong></summary>

- 🔴 Fortschrittsbalken für definierte Ziele
- 🟡 Milestone-Tracking

</details>

<details>
<summary><strong>Szenarien & Simulationen</strong></summary>

- 🟡 Szenarien mit Schiebereglern und Life-Events
    - Erhöhung der Sparrate, Jobwechsel, Familiengründung, Immobilienkauf
- 🟡 Simulation extremer Ereignisse (z. B. Börsencrash)

</details>

<details>
<summary><strong>KI-Funktionen</strong></summary>

- 🟡 KI-Chat für spezifische Fragen, die das Dashboard nicht abdeckt
- 🟢 KI-basierte Vorschläge und Empfehlungen zur Finanzoptimierung

</details>

<details>
<summary><strong>Integrationen</strong></summary>

- 🟢 Anbindung an Banken und Depots (z. B. via FinTS / Open Banking)
- ⚪ Anbindung an Krypto-Wallets

</details>

<details>
<summary><strong>Sonstiges</strong></summary>

- 🟢 FAQ-Bereich

</details>

---

## ⚠️ Constraints & Akzeptanzkriterien

> Aus den Interviews abgeleitete Ausschlusskriterien, die als übergreifende Qualitätsziele gelten:

| Kriterium | Beschreibung |
|-----------|--------------|
| 🚫 Kein übermäßiger manueller Aufwand | Dateneingabe muss zumutbar bleiben – wo möglich automatisieren oder vorbelegen |
| 🚫 Keine mangelnde Transparenz | Berechnungslogik muss für den Nutzer jederzeit nachvollziehbar sein |
| 🚫 Keine Überforderung | Komplexität wird schrittweise eingeführt (Progressive Disclosure) |