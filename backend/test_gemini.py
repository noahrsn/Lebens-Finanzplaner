"""
Konsolen-Test für den Gemini-Chat.
Ausführen aus dem backend/-Verzeichnis:
    python test_gemini.py [mode]

Modi:
    single          – Eine einzelne allgemeine Frage
    conversation    – Mehrturniges Gespräch ohne Finanzdaten
    profile         – Chat mit Beispiel-Finanzdaten (simuliert eingeloggten User)
    interactive     – Interaktiver Chat ohne Finanzdaten
    interactive-pro – Interaktiver Chat mit Beispiel-Finanzdaten
    all (default)   – single + conversation + profile
"""
import sys
import os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from ai.gemini_service import chat, format_profile_as_context

# Beispielprofil, das einen eingeloggten User simuliert
EXAMPLE_PROFILE = {
    "benutzer": {
        "email": "max@example.com",
        "name": "Mustermann",
        "vorname": "Max",
        "geburtsdatum": "1990-05-15",
    },
    "einnahmen_und_ausgaben": {
        "monatliches_netto_gehalt": 3200,
        "monatliche_fixkosten": 1500,
        "monatliche_variable_ausgaben": 600,
        "sparraten": {
            "gesamt_monatlich": 1100,
            "aufteilung": {"tagesgeld": 600, "depot": 500},
        },
    },
    "konten_und_vermoegenswerte": {
        "girokonto_stand": 2000,
        "tagesgeld_stand": 6000,
        "ruecklagen": 0,
        "depot_wertpapiere": 18650,
        "versicherungsvertraege_wert": 0,
    },
    "altersvorsorge": {
        "geplantes_renteneintrittsalter": 67,
        "aktuelle_rentenpunkte": 0,
        "erwartete_rentenpunkte_bei_eintritt": 40,
    },
    "ziele_und_wuensche": [
        {"titel": "Neues Auto", "zielbetrag": 15000, "aktueller_fortschritt": 3000, "zieldatum_jahr": 2027},
        {"titel": "Weltreise", "zielbetrag": 8000, "aktueller_fortschritt": 0, "zieldatum_jahr": 2028},
    ],
    "szenarien_und_simulationen": {
        "angenommene_inflation_prozent": 2.0,
        "life_events": [],
    },
}


def run_single_test():
    print("=== Einzelner Chat-Test (ohne Finanzdaten) ===")
    result = chat("Was ist ein ETF und warum eignet er sich zum Vermögensaufbau?")
    print(f"Antwort:\n{result['reply']}\n")
    print(f"History-Einträge: {len(result['history'])}")


def run_conversation_test():
    print("\n=== Mehrturniger Gesprächs-Test (ohne Finanzdaten) ===")
    history = []
    turns = [
        "Ich spare monatlich 200€. Wie viel habe ich nach 10 Jahren bei 6% Rendite?",
        "Welche ETFs empfiehlst du für Anfänger?",
        "Wie viel Notgroschen sollte ich haben?",
    ]
    for i, message in enumerate(turns, 1):
        print(f"\nTurn {i} – Nutzer: {message}")
        result = chat(message=message, history=history)
        history = result["history"]
        preview = result["reply"][:300].replace("\n", " ")
        print(f"Gemini: {preview}{'...' if len(result['reply']) > 300 else ''}")
    print(f"\nGesamte History-Länge: {len(history)} Einträge")


def run_profile_test():
    print("\n=== Chat-Test MIT Finanzdaten (simulierter eingeloggter User) ===")
    context = format_profile_as_context(EXAMPLE_PROFILE)
    print("--- Generierter Finanzkontext ---")
    print(context)
    print("\n--- Gemini-Antworten ---")

    history = []
    turns = [
        "Wie ist meine aktuelle finanzielle Situation?",
        "Kann ich mein Ziel 'Neues Auto' bis 2027 erreichen?",
        "Wie hoch ist meine Sparquote und ist das gut?",
    ]
    for i, message in enumerate(turns, 1):
        print(f"\nTurn {i} – Nutzer: {message}")
        result = chat(message=message, history=history, financial_context=context)
        history = result["history"]
        preview = result["reply"][:400].replace("\n", " ")
        print(f"Gemini: {preview}{'...' if len(result['reply']) > 400 else ''}")
    print(f"\nGesamte History-Länge: {len(history)} Einträge")


def run_interactive(with_profile: bool = False):
    context = None
    if with_profile:
        context = format_profile_as_context(EXAMPLE_PROFILE)
        print("\n=== Interaktiver Chat MIT Beispiel-Finanzdaten (exit zum Beenden) ===")
        print("(Finanzdaten von Max Mustermann sind geladen)")
    else:
        print("\n=== Interaktiver Chat ohne Finanzdaten (exit zum Beenden) ===")

    history = []
    while True:
        try:
            user_input = input("\nDu: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBeendet.")
            break
        if user_input.lower() in ("exit", "quit", "q"):
            print("Beendet.")
            break
        if not user_input:
            continue

        result = chat(message=user_input, history=history, financial_context=context)
        history = result["history"]
        print(f"\nGemini: {result['reply']}")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    if mode == "single":
        run_single_test()
    elif mode == "conversation":
        run_conversation_test()
    elif mode == "profile":
        run_profile_test()
    elif mode == "interactive":
        run_interactive(with_profile=False)
    elif mode == "interactive-pro":
        run_interactive(with_profile=True)
    else:
        run_single_test()
        run_conversation_test()
        run_profile_test()
        print("\nTipps:")
        print("  python test_gemini.py interactive      – Chat ohne Daten")
        print("  python test_gemini.py interactive-pro  – Chat mit Beispiel-Finanzdaten")
