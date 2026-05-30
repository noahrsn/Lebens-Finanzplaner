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
    simulate_dynamic_cashflow,
    calc_fire_number,
    simulate_withdrawal_plan,
    simulate_mortgage,
    calc_mortgage_rate,
    calc_capital_gains_tax
)

def print_result(name, data):
    print(f"\n--- Resultat für {name} ---")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=4, ensure_ascii=False))
    else:
        print(f"{data}\n")

def run_get_time_horizon():
    result = get_time_horizon(geburtsdatum="1990-05-15", renteneintrittsalter=67)
    print_result("get_time_horizon", result)

def run_calc_monthly_cashflow():
    result = calc_monthly_cashflow(netto=3500.0, fixkosten=1200.0, variabel=800.0, sparraten_gesamt=500.0)
    print_result("calc_monthly_cashflow", result)

def run_evaluate_emergency_fund():
    result = evaluate_emergency_fund(ruecklagen=8000.0, fixkosten=1200.0, variabel=800.0)
    print_result("evaluate_emergency_fund", result)

def run_calc_net_worth():
    vermoegenswerte = {
        "Girokonto": 2500.0,
        "Tagesgeld": 8000.0,
        "ETF-Depot": 15000.0,
        "Krypto": 1500.0
    }
    result = calc_net_worth(konten_und_vermoegenswerte=vermoegenswerte)
    print(f"\n--- Resultat für calc_net_worth ---")
    print(f"{result} €\n")

def run_calc_statutory_pension():
    result = calc_statutory_pension(erwartete_punkte=45.0, rentenwert=39.32)
    print_result("calc_statutory_pension", result)

def run_calc_pension_gap():
    result = calc_pension_gap(wunschrente_heutig=2500.0, erwartete_nettorente=1415.52, inflation_prozent=2.0, jahre_bis_rente=31)
    print_result("calc_pension_gap", result)

def run_simulate_asset_growth():
    result = simulate_asset_growth(
        start_depot=15000.0, start_tagesgeld=8000.0,
        sparrate_depot=400.0, sparrate_tagesgeld=100.0,
        jahre=3, rendite_depot=0.06, rendite_tagesgeld=0.02
    )
    print_result("simulate_asset_growth", result)

def run_simulate_purchasing_power():
    result = simulate_purchasing_power(startwert=1000.0, inflation_prozent=2.0, jahre=3)
    print_result("simulate_purchasing_power", result)

def run_evaluate_goals():
    ziele = [
        {"titel": "Neues Auto", "zielbetrag": 15000.0, "aktueller_fortschritt": 5000.0, "ziel_jahr": 2028},
        {"titel": "Weltreise", "zielbetrag": 10000.0, "aktueller_fortschritt": 0.0, "ziel_jahr": 2030}
    ]
    result = evaluate_goals(ziele=ziele, verfuegbarer_cashflow=1000.0, aktuelles_jahr=2026)
    print_result("evaluate_goals", result)

def run_simulate_dynamic_cashflow():
    life_events = [
        {"titel": "Gehaltserhöhung", "eintrittsjahr": 2028, "einkommen_anpassung": 300.0, "ausgaben_anpassung": 50.0}
    ]
    result = simulate_dynamic_cashflow(
        start_einkommen=3500.0, start_ausgaben=2000.0,
        life_events=life_events, start_jahr=2026, end_jahr=2029
    )
    print_result("simulate_dynamic_cashflow", result)

def run_calc_fire_number():
    result = calc_fire_number(monatlicher_bedarf_netto=3000.0, sichere_entnahmerate=0.04)
    print_result("calc_fire_number", result)

def run_simulate_withdrawal_plan():
    result = simulate_withdrawal_plan(
        startkapital=1000000.0, start_entnahme_monatlich=3000.0,
        rendite_prozent=0.05, inflation_prozent=0.02, max_jahre=5
    )
    print_result("simulate_withdrawal_plan (5 Jahre)", result)

def run_simulate_mortgage():
    result = simulate_mortgage(
        kreditsumme=350000.0, sollzins_prozent=3.5, anfangs_tilgung_prozent=2.0, laufzeit_jahre=3
    )
    print_result("simulate_mortgage (3 Jahre)", result)

def run_calc_mortgage_rate():
    result = calc_mortgage_rate(kreditsumme=350000.0, sollzins_prozent=3.5, anfangs_tilgung_prozent=2.0)
    print(f"\n--- Resultat für calc_mortgage_rate ---")
    print(f"{result} €\n")

def run_calc_capital_gains_tax():
    result = calc_capital_gains_tax(entnahme_betrag=2000.0, gewinn_anteil_prozent=30.0, freistellungsauftrag_rest=200.0)
    print_result("calc_capital_gains_tax", result)

if __name__ == '__main__':
    # =========================================================================
    # Kommentiere einfach die Methode(n) ein, die du gerade testen möchtest:
    # =========================================================================

    run_calc_fire_number()
    #run_get_time_horizon()
    #run_calc_monthly_cashflow()
    #run_evaluate_emergency_fund()
    #run_calc_net_worth()
    #run_calc_statutory_pension()
    #run_calc_pension_gap()
    #run_simulate_asset_growth()
    #run_simulate_purchasing_power()
    #run_evaluate_goals()
    #run_simulate_dynamic_cashflow()
    #run_calc_fire_number()
    #run_simulate_withdrawal_plan()
    #run_simulate_mortgage()
    #run_calc_mortgage_rate()
    #run_calc_capital_gains_tax()
