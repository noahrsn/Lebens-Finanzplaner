import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
if not _api_key:
    raise ValueError("GEMINI_API_KEY ist in der .env nicht gesetzt!")

_client = genai.Client(api_key=_api_key)

_MODEL = "gemini-flash-latest"

# --- Prompt-Engineering ---------------------------------------------------
# Der System-Prompt ist bewusst in klare Abschnitte gegliedert (Rolle,
# Aufgaben, Vorgehen, Ton/Format, Leitplanken). Diese Struktur hilft dem
# Modell, konsistente, personalisierte und sichere Finanzantworten zu geben.

_BASE_INSTRUCTION = (
    "# Rolle\n"
    "Du bist „Fin“, der persönliche Finanzassistent der App „Lebens-Finanzplaner“. "
    "Du agierst wie ein ruhiger, kompetenter und motivierender Finanzcoach – nicht wie ein Verkäufer.\n\n"

    "# Deine Aufgabe\n"
    "Du unterstützt Nutzer bei persönlichen Finanzen: Budgetplanung, Sparen, Schuldenabbau, "
    "Notgroschen, Altersvorsorge, Geldanlage-Grundlagen und dem Erreichen finanzieller Ziele. "
    "Du hilfst, komplexe Zusammenhänge einfach und alltagstauglich zu erklären.\n\n"

    "# Vorgehen\n"
    "- Denke Schritt für Schritt, bevor du antwortest: Was will der Nutzer wirklich wissen?\n"
    "- Wenn eine Frage unklar oder wichtige Angaben fehlen, stelle EINE gezielte Rückfrage, "
    "statt Annahmen zu raten.\n"
    "- Rechne bei Bedarf konkret vor (z. B. Sparrate × Monate) und zeige den Rechenweg kurz.\n"
    "- Priorisiere Ratschläge nach Wirkung: erst Notgroschen & teure Schulden, dann Sparen/Anlegen.\n"
    "- Gib konkrete, umsetzbare nächste Schritte statt allgemeiner Floskeln.\n\n"

    "# Ton & Format\n"
    "- Antworte immer auf Deutsch, freundlich, präzise und ohne unnötigen Fachjargon. "
    "Erkläre Fachbegriffe, wenn du sie verwendest.\n"
    "- Fasse dich kurz: standardmäßig 2–5 Sätze oder eine kurze Liste. Nur ausführlicher, "
    "wenn der Nutzer es verlangt oder das Thema es erfordert.\n"
    "- Nutze Markdown (Aufzählungen, **Fettung** für Zahlen/Kernaussagen) für Lesbarkeit.\n"
    "- Formatiere Geldbeträge im deutschen Format mit Euro-Zeichen (z. B. 1.250 €).\n\n"

    "# Leitplanken (wichtig)\n"
    "- Du gibst allgemeine Finanzbildung und Orientierung, KEINE regulierte Anlage-, Steuer- "
    "oder Rechtsberatung. Weise bei konkreten Anlage-/Steuerentscheidungen kurz darauf hin, "
    "dass eine individuelle Beratung sinnvoll sein kann.\n"
    "- Empfehle NIEMALS einzelne Aktien, Krypto-Coins oder konkrete Produkte als „Geheimtipp“ "
    "und verspreche keine Renditen. Bleibe bei bewährten, breit gestreuten Prinzipien.\n"
    "- Erfinde KEINE Zahlen. Nutze nur die Daten, die dir im Nutzerkontext gegeben werden, "
    "oder allgemein anerkannte Faustregeln (die du als solche kennzeichnest).\n"
    "- Behandle die Finanzdaten des Nutzers vertraulich und wertfrei. Keine Moralpredigten.\n"
    "- Bleibe beim Thema Finanzen. Bei themenfremden Fragen lenke freundlich zurück."
)

_NO_DATA_NOTE = (
    "\n\n# Aktueller Datenzugriff\n"
    "Der Nutzer ist NICHT angemeldet. Du hast keinen Zugriff auf persönliche Finanzdaten. "
    "Gib daher nur allgemeine Beratung und Faustregeln. Wenn eine gute Antwort persönliche "
    "Zahlen bräuchte, weise freundlich darauf hin, dass sich der Nutzer anmelden kann, "
    "damit du personalisierte Empfehlungen geben kannst."
)

# Etwas niedrigere Temperatur = faktentreuere, weniger „ausschmückende“
# Finanzantworten; Rest sind sinnvolle Defaults für Chat-Antworten.
_GENERATION_CONFIG = {
    "temperature": 0.4,
    "top_p": 0.95,
    "max_output_tokens": 1024,
}


def _eur(value) -> str:
    return f"{float(value):,.0f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def format_profile_as_context(profile: dict) -> str:
    """Wandelt ein Finanzprofil in einen lesbaren Kontext-String für Gemini um."""
    lines = ["=== Persönliche Finanzdaten des Nutzers ==="]

    benutzer = profile.get("benutzer", {})
    if benutzer:
        name = f"{benutzer.get('vorname', '')} {benutzer.get('name', '')}".strip()
        if name:
            lines.append(f"Name: {name}")
        if benutzer.get("geburtsdatum"):
            lines.append(f"Geburtsdatum: {benutzer['geburtsdatum']}")

    e_a = profile.get("einnahmen_und_ausgaben", {})
    if e_a:
        lines.append("\n--- Einnahmen & Ausgaben (monatlich) ---")
        lines.append(f"Netto-Gehalt:       {_eur(e_a.get('monatliches_netto_gehalt', 0))}")
        lines.append(f"Fixkosten:          {_eur(e_a.get('monatliche_fixkosten', 0))}")
        lines.append(f"Variable Ausgaben:  {_eur(e_a.get('monatliche_variable_ausgaben', 0))}")
        sparraten = e_a.get("sparraten", {})
        lines.append(f"Sparrate gesamt:    {_eur(sparraten.get('gesamt_monatlich', 0))}")
        aufteilung = sparraten.get("aufteilung", {})
        for konto, betrag in aufteilung.items():
            lines.append(f"  - {konto}: {_eur(betrag)}")

    konten = profile.get("konten_und_vermoegenswerte", {})
    if konten:
        lines.append("\n--- Konten & Vermögenswerte ---")
        lines.append(f"Girokonto:              {_eur(konten.get('girokonto_stand', 0))}")
        lines.append(f"Tagesgeld:              {_eur(konten.get('tagesgeld_stand', 0))}")
        lines.append(f"Rücklagen:              {_eur(konten.get('ruecklagen', 0))}")
        lines.append(f"Depot/Wertpapiere:      {_eur(konten.get('depot_wertpapiere', 0))}")
        lines.append(f"Versicherungsverträge:  {_eur(konten.get('versicherungsvertraege_wert', 0))}")
        gesamt = sum(float(v) for v in konten.values() if isinstance(v, (int, float)))
        lines.append(f"Nettovermögen gesamt:   {_eur(gesamt)}")

    altersvorsorge = profile.get("altersvorsorge", {})
    if altersvorsorge:
        lines.append("\n--- Altersvorsorge ---")
        lines.append(f"Geplantes Renteneintrittsalter: {altersvorsorge.get('geplantes_renteneintrittsalter', '?')}")
        lines.append(f"Aktuelle Rentenpunkte:          {altersvorsorge.get('aktuelle_rentenpunkte', 0)}")
        lines.append(f"Erwartete Rentenpunkte:         {altersvorsorge.get('erwartete_rentenpunkte_bei_eintritt', 0)}")

    ziele = profile.get("ziele_und_wuensche", [])
    lines.append("\n--- Ziele & Wünsche ---")
    if ziele:
        for z in ziele:
            titel = z.get("titel", "Unbekannt")
            betrag = z.get("zielbetrag", 0)
            fortschritt = z.get("aktueller_fortschritt", 0)
            jahr = z.get("zieldatum_jahr", "?")
            lines.append(f"• {titel}: {_eur(fortschritt)} / {_eur(betrag)} (Ziel: {jahr})")
    else:
        lines.append("(keine Ziele hinterlegt)")

    szenarien = profile.get("szenarien_und_simulationen", {})
    if szenarien:
        lines.append("\n--- Szenarien ---")
        lines.append(f"Angenommene Inflation: {szenarien.get('angenommene_inflation_prozent', 2.0)} %")
        events = szenarien.get("life_events", [])
        if events:
            for e in events:
                lines.append(
                    f"• {e.get('ereignis_typ', '?')} ({e.get('eintrittsjahr', '?')}): "
                    f"Einkommen {_eur(e.get('auswirkung_auf_einkommen_monatlich', 0))}/Monat, "
                    f"Ausgaben {_eur(e.get('auswirkung_auf_ausgaben_monatlich', 0))}/Monat"
                )
        else:
            lines.append("Life Events: (keine)")

    return "\n".join(lines)


def _build_system_instruction(financial_context: str | None) -> str:
    if financial_context:
        return (
            _BASE_INSTRUCTION
            + "\n\n# Finanzdaten des Nutzers\n"
            "Dir liegen die aktuellen, echten Finanzdaten des angemeldeten Nutzers vor (siehe unten). "
            "Nutze sie, um personalisierte, konkrete Antworten zu geben und beziehe dich bei "
            "passenden Fragen direkt auf seine Zahlen (z. B. Sparrate, Ziele, Kontostände). "
            "Verwende ausschließlich diese Werte – runde oder erfinde nichts hinzu. "
            "Wenn für eine Antwort relevante Angaben fehlen, sag das offen und frag nach.\n\n"
            + financial_context
        )
    return _BASE_INSTRUCTION + _NO_DATA_NOTE


def chat(message: str, history: list[dict] | None = None, financial_context: str | None = None) -> dict:
    """
    Sendet eine Nachricht an Gemini und gibt Antwort + aktualisierte History zurück.

    history:          Liste von {"role": "user"|"model", "parts": "text"} dicts
    financial_context: Formatierter Kontext-String aus format_profile_as_context()
    Gibt zurück: {"reply": str, "history": list[dict]}
    """
    contents: list[types.Content] = []
    for entry in (history or []):
        contents.append(
            types.Content(
                role=entry["role"],
                parts=[types.Part(text=entry["parts"])],
            )
        )
    contents.append(
        types.Content(role="user", parts=[types.Part(text=message)])
    )

    response = _client.models.generate_content(
        model=_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=_build_system_instruction(financial_context),
            **_GENERATION_CONFIG,
        ),
    )
    reply_text = response.text

    updated_history = list(history or []) + [
        {"role": "user", "parts": message},
        {"role": "model", "parts": reply_text},
    ]

    return {"reply": reply_text, "history": updated_history}
