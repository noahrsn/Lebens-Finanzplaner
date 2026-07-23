# Dokumentation Noah

**Autor:** Noah Roosen (`noahrsn` / no.roosen@gmail.com)
**Zeitraum:** April 2026 – Juli 2026
**Umfang:** 26 Commits

> Diese Übersicht wurde aus der Git-History abgeleitet. Ergänze gerne fehlende Punkte
> (z. B. Konzeptarbeit, Reviews, Absprachen), die nicht im Code sichtbar sind.

---

## 1. Projekt-Setup & Infrastruktur (April 2026)

Grundgerüst des Projekts aufgebaut und die Deployment-Basis geschaffen.

- **Flask-Anwendung initialisiert** – Grundstruktur mit Environment-Konfiguration (`app.py`, `templates/`, `startup.txt`)
- **`.gitignore`** angelegt (Environment-Variablen, Python-Cache, IDE-Settings, Azure-Dateien)
- **Azure App Service Deployment-Workflow** konfiguriert (`.github/workflows/main_lebens-finanzplaner.yml`)
- **Repository-Aufräumarbeiten** – versehentlich eingecheckte `.env` und `.idea/`-Dateien entfernt
- **Anforderungsdokumentation** erstellt (`REQUIREMENTS.md`) und `requirements.txt` gepflegt

## 2. Datenbank-Anbindung (Mai – Juni 2026)

Datenbank-Layer aufgebaut und später auf eine neue Plattform migriert.

- **Cosmos DB Service** implementiert – Setup-, Read-, Write- und Query-Funktionen (`database/cosmos_service.py`)
- **Refactoring** der Cosmos-DB-Funktionen inkl. verbessertem Error-Handling
- **Migration Cosmos DB → Supabase** – User- und Financial-Profile-Verwaltung auf Supabase umgestellt
  (`backend/database/supabase_service.py`, `user_service.py`, `financial_profile_service.py`)
- **Passwort-Reset** auf Supabase-Client umgestellt (`backend/routes/auth_routes.py`)

## 3. Finanzmathematik (Mai 2026)

- **Finanz-Kalkulator** implementiert – Kernberechnungen des Finanzplaners (`backend/finance_math/calculator.py`, ~300 Zeilen)
- **Tests** dazu geschrieben – manuelle Tests, Konsolen-Tests und Unit-Tests
  (`manual_tests.py`, `test_calculator.py`, `test_console.py`)

## 4. Deployment: Render-Webapp für Backend & Frontend (Juni 2026)

Kompletter Umzug der Anwendung auf **Render** – sowohl das Flask-Backend als auch das
React-Frontend eingerichtet und lauffähig gemacht.

- **Render-Webapp für das Backend** aufgesetzt (Flask-Service) inkl. Health-Check-Route
- **Render-Webapp für das Frontend** aufgesetzt (React/Vite) inkl. SPA-Routing über `_redirects`
- **CORS-Konfiguration** für dynamische Frontend-Origins, damit Frontend und Backend
  als getrennte Render-Services zusammenarbeiten (`backend/app.py`)
- **Session-Cookie-Konfiguration** (SameSite/Secure) für sichere Cross-Site-Nutzung
  zwischen den getrennten Render-Domains
- **Frontend-API-URLs** auf die Render-Backend-URL umgestellt (mehrere `frontend/src/pages/*`)
- **Umzug** von der ursprünglichen Azure-Infrastruktur auf Render/Supabase durchgeführt

## 5. KI-Finanzassistent (Juni – Juli 2026)

Ein eigenes Feature-Modul: der KI-basierte Finanzassistent.

- **Gemini-Service** implementiert – Anbindung an das Sprachmodell (`backend/ai/gemini_service.py`)
- **Chat-Routen** im Backend (`backend/routes/chat_routes.py`)
- **Frontend-Seite `KiAssist.jsx`** (~280 Zeilen) inkl. Routing-Einbindung in `App.jsx`
- **Tests** für den Gemini-Service (`backend/test_gemini.py`)
- **Prompt Engineering** – Optimierung der Prompts für bessere Antworten des Assistenten

---

## Schwerpunkte auf einen Blick

| Bereich | Rolle |
|---|---|
| Backend / Flask | Aufbau & Wartung |
| Datenbank (Cosmos → Supabase) | Implementierung & Migration |
| Finanzmathematik | Kernlogik & Tests |
| Deployment auf Render (Backend + Frontend) | Einrichtung & Betrieb |
| KI-Finanzassistent | Feature-Entwicklung (Backend + Frontend) |

**Kurzfazit:** Fokus auf **Backend, Deployment/Infrastruktur (Render) und das KI-Assistenten-Feature**.
Von der ersten Projekt-Initialisierung über das Render-Deployment bis zum KI-Feature durchgehend beteiligt.
