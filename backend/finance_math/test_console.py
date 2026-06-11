import json
from calculator import (
    get_time_horizon,
    calc_monthly_cashflow,
    evaluate_emergency_fund,
    calc_net_worth,
    calc_statutory_pension,
    calc_pension_gap,
    simulate_asset_growth,
    simulate_purchasing_power,
    evaluate_goals,
    simulate_dynamic_cashflow
)

def format_json(data):
    """Hilfsfunktion für eine schöne Konsolenausgabe."""
    return json.dumps(data, indent=4, ensure_ascii=False)

def run_all_tests():
    print("=== TEST START: Finanzmathematische Berechnungen ===\n")

    # 1. Basis- & Cashflow-Metriken
    print("--- 1. get_time_horizon ---")
    res_time = get_time_horizon(geburtsdatum="1990-05-15", renteneintrittsalter=67)
    print(format_json(res_time), "\n")

    print("--- 2. calc_monthly_cashflow ---")
    res_cashflow = calc_monthly_cashflow(netto=3500.0, fixkosten=1200.0, variabel=800.0, sparraten_gesamt=500.0)
    print(format_json(res_cashflow), "\n")

    print("--- 3. evaluate_emergency_fund ---")
    res_emergency = evaluate_emergency_fund(ruecklagen=8000.0, fixkosten=1200.0, variabel=800.0)
    print(format_json(res_emergency), "\n")

    print("--- 4. calc_net_worth ---")
    vermoegenswerte = {
        "Girokonto": 2500.0,
        "Tagesgeld": 8000.0,
        "ETF-Depot": 15000.0,
        "Krypto": 1500.0
    }
    res_net_worth = calc_net_worth(konten_und_vermoegenswerte=vermoegenswerte)
    print(f"{res_net_worth} €\n")


    # 2. Altersvorsorge
    print("--- 5. calc_statutory_pension ---")
    res_pension = calc_statutory_pension(erwartete_punkte=45.0, rentenwert=39.32)
    print(format_json(res_pension), "\n")

    print("--- 6. calc_pension_gap ---")
    # jahre_bis_rente dynamisch aus get_time_horizon nutzen
    jahre = res_time["jahre_bis_rente"]
    res_gap = calc_pension_gap(wunschrente_heutig=2500.0, erwartete_nettorente=res_pension["nettorente_schaetzung"], inflation_prozent=2.0, jahre_bis_rente=jahre)
    print(format_json(res_gap), "\n")


    # 3. Zeitreihen-Simulationen (Für Frontend-Diagramme)
    print("--- 7. simulate_asset_growth (für 3 Jahre) ---")
    res_asset_growth = simulate_asset_growth(
        start_depot=15000.0, start_tagesgeld=8000.0,
        sparrate_depot=400.0, sparrate_tagesgeld=100.0,
        jahre=3, rendite_depot=0.06, rendite_tagesgeld=0.02
    )
    print(format_json(res_asset_growth), "\n")

    print("--- 8. simulate_purchasing_power (für 3 Jahre) ---")
    res_purchasing_power = simulate_purchasing_power(startwert=1000.0, inflation_prozent=2.0, jahre=3)
    print(format_json(res_purchasing_power), "\n")


    # 4. Zielerreichung
    print("--- 9. evaluate_goals ---")
    ziele = [
        {"titel": "Neues Auto", "zielbetrag": 15000.0, "aktueller_fortschritt": 5000.0, "ziel_jahr": 2028},
        {"titel": "Weltreise", "zielbetrag": 10000.0, "aktueller_fortschritt": 0.0, "ziel_jahr": 2030}
    ]
    res_goals = evaluate_goals(ziele=ziele, verfuegbarer_cashflow=1000.0, aktuelles_jahr=2026)
    print(format_json(res_goals), "\n")


    # 5. Dynamische Szenarien
    print("--- 10. simulate_dynamic_cashflow (2026 bis 2029) ---")
    life_events = [
        {"titel": "Gehaltserhöhung", "eintrittsjahr": 2028, "einkommen_anpassung": 300.0, "ausgaben_anpassung": 50.0}
    ]
    res_dynamic_cf = simulate_dynamic_cashflow(
        start_einkommen=3500.0, start_ausgaben=2000.0,
        life_events=life_events, start_jahr=2026, end_jahr=2029
    )
    print(format_json(res_dynamic_cf), "\n")

    print("=== TEST ENDE ===")

if __name__ == "__main__":
    run_all_tests()

