import unittest
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

def print_result(name, data):
    print(f"\n--- Resultat für {name} ---")
    print(json.dumps(data, indent=4, ensure_ascii=False))

class TestFinanceMath(unittest.TestCase):

    def test_get_time_horizon(self):
        result = get_time_horizon(geburtsdatum="1990-05-15", renteneintrittsalter=67)
        print_result("get_time_horizon", result)
        self.assertIn("aktuelles_alter", result)
        self.assertIn("jahre_bis_rente", result)

    def test_calc_monthly_cashflow(self):
        result = calc_monthly_cashflow(netto=3500.0, fixkosten=1200.0, variabel=800.0, sparraten_gesamt=500.0)
        print_result("calc_monthly_cashflow", result)
        self.assertIn("ueberschuss", result)

    def test_evaluate_emergency_fund(self):
        result = evaluate_emergency_fund(ruecklagen=8000.0, fixkosten=1200.0, variabel=800.0)
        print_result("evaluate_emergency_fund", result)
        self.assertTrue(result["ist_ausreichend"])

    def test_calc_net_worth(self):
        vermoegenswerte = {
            "Girokonto": 2500.0,
            "Tagesgeld": 8000.0,
            "ETF-Depot": 15000.0,
            "Krypto": 1500.0
        }
        result = calc_net_worth(konten_und_vermoegenswerte=vermoegenswerte)
        print(f"\n--- Resultat für calc_net_worth ---")
        print(f"{result} €")
        self.assertEqual(result, 27000.0)

    def test_calc_statutory_pension(self):
        result = calc_statutory_pension(erwartete_punkte=45.0, rentenwert=39.32)
        print_result("calc_statutory_pension", result)
        self.assertIn("bruttorente", result)

    def test_calc_pension_gap(self):
        result = calc_pension_gap(wunschrente_heutig=2500.0, erwartete_nettorente=1415.52, inflation_prozent=2.0, jahre_bis_rente=31)
        print_result("calc_pension_gap", result)
        self.assertIn("rentenluecke", result)

    def test_simulate_asset_growth(self):
        result = simulate_asset_growth(
            start_depot=15000.0, start_tagesgeld=8000.0,
            sparrate_depot=400.0, sparrate_tagesgeld=100.0,
            jahre=3, rendite_depot=0.06, rendite_tagesgeld=0.02
        )
        print_result("simulate_asset_growth", result)
        self.assertEqual(len(result), 3)

    def test_simulate_purchasing_power(self):
        result = simulate_purchasing_power(startwert=1000.0, inflation_prozent=2.0, jahre=3)
        print_result("simulate_purchasing_power", result)
        self.assertEqual(len(result), 3)

    def test_evaluate_goals(self):
        ziele = [
            {"titel": "Neues Auto", "zielbetrag": 15000.0, "aktueller_fortschritt": 5000.0, "ziel_jahr": 2028},
            {"titel": "Weltreise", "zielbetrag": 10000.0, "aktueller_fortschritt": 0.0, "ziel_jahr": 2030}
        ]
        result = evaluate_goals(ziele=ziele, verfuegbarer_cashflow=1000.0, aktuelles_jahr=2026)
        print_result("evaluate_goals", result)
        self.assertEqual(len(result), 2)

    def test_simulate_dynamic_cashflow(self):
        life_events = [
            {"titel": "Gehaltserhöhung", "eintrittsjahr": 2028, "einkommen_anpassung": 300.0, "ausgaben_anpassung": 50.0}
        ]
        result = simulate_dynamic_cashflow(
            start_einkommen=3500.0, start_ausgaben=2000.0,
            life_events=life_events, start_jahr=2026, end_jahr=2029
        )
        print_result("simulate_dynamic_cashflow", result)
        self.assertEqual(len(result), 4)

if __name__ == '__main__':
    unittest.main()

