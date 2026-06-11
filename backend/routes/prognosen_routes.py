from flask import Blueprint, jsonify, session
from datetime import datetime
from database.financial_profile_service import get_financial_profile
from finance_math.calculator import (
    calc_monthly_cashflow,
    calc_net_worth,
    simulate_asset_growth,
)

prognosen_bp = Blueprint("prognosen", __name__)

def _current_user_id():
    return session.get("user_id")

@prognosen_bp.route("/api/prognosen", methods=["GET"])
def get_prognosen():
    # NOTE: temp bypass for the user
    user_id = _current_user_id()
    if not user_id:
        user_id = "test-user-id"

    profile = None
    try:
        profile = get_financial_profile(user_id)
    except Exception as e:
        print(f"DB error: {e}")
        # profile remains None

    # hardcoded "dummy" data
    if not profile:
        profile = {
            "einnahmen_und_ausgaben": {
                "monatliches_netto_gehalt": 3200,
                "monatliche_fixkosten": 1500,
                "monatliche_variable_ausgaben": 600,
                "sparraten": {
                    "gesamt_monatlich": 1100,
                    "aufteilung": {"tagesgeld": 600, "depot": 500}
                }
            },
            "konten_und_vermoegenswerte": {
                "girokonto_stand": 2000,
                "tagesgeld_stand": 6000,
                "ruecklagen": 0,
                "depot_wertpapiere": 18650,
                "versicherungsvertraege_wert": 0
            }
        }

    e_und_a = profile.get("einnahmen_und_ausgaben", {})
    konten = profile.get("konten_und_vermoegenswerte", {})
    
    netto = float(e_und_a.get("monatliches_netto_gehalt", 0))
    fixkosten = float(e_und_a.get("monatliche_fixkosten", 0))
    variabel = float(e_und_a.get("monatliche_variable_ausgaben", 0))
    sparraten_gesamt = float(e_und_a.get("sparraten", {}).get("gesamt_monatlich", 0))
    
    cashflow = calc_monthly_cashflow(netto, fixkosten, variabel, sparraten_gesamt)
    net_worth = calc_net_worth(konten)

    start_depot = float(konten.get("depot_wertpapiere", 0))
    start_tagesgeld = float(konten.get("tagesgeld_stand", 0)) + float(konten.get("ruecklagen", 0))
    sparrate_tagesgeld = float(e_und_a.get("sparraten", {}).get("aufteilung", {}).get("tagesgeld", 0))
    sparrate_depot = float(e_und_a.get("sparraten", {}).get("aufteilung", {}).get("depot", 0))

    wealth_growth = simulate_asset_growth(
        start_depot=start_depot,
        start_tagesgeld=start_tagesgeld,
        sparrate_depot=sparrate_depot,
        sparrate_tagesgeld=sparrate_tagesgeld,
        jahre=10
    )

    current_year = datetime.now().year
    
    # KPS
    kpis = [
        {
            "label": "Sparquote",
            "value": f"{int(cashflow['sparquote_prozent'])}%",
            "tag": "Aktuell",
            "sub": f"Ziel: {(int(cashflow['sparquote_prozent']) + 5)}%",
            "iconBg": "bg-emerald-50"
        },
        {
            "label": "Jährliche Ersparnis",
            "value": f"{int(sparraten_gesamt * 12):,}€".replace(',', '.'),
            "tag": "Dieses Jahr",
            "sub": "Laufend",
            "iconBg": "bg-cyan-50"
        },
        {
            "label": "Durchschn. Ausgaben",
            "value": f"{int(cashflow['gesamt_ausgaben'] - sparraten_gesamt):,}€".replace(',', '.'),
            "tag": "Monatlich",
            "sub": f"Davon Fix: {int(fixkosten)}€",
            "iconBg": "bg-amber-50"
        },
        {
            "label": "Nettovermögen",
            "value": f"{int(net_worth):,}€".replace(',', '.'),
            "tag": "Aktuell",
            "sub": "Ohne Immobilien",
            "iconBg": "bg-purple-50"
        }
    ]

    # monthly data
    months = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
    monthly_data = []
    
    # a linear projection for the current year
    current_ausgaben = fixkosten + variabel
    current_erspartes = sparraten_gesamt
    
    for i, m in enumerate(months):
        monthly_data.append({
            "m": m,
            "Einkommen": int(netto),
            "Ausgaben": int(current_ausgaben),
            "Erspartes": int(current_erspartes)
        })

    wealth_data = []
    for wg in wealth_growth:
        wealth_data.append({
            "m": str(current_year + wg["jahr"]),
            "Vermögen": int(wg["gesamt_wert"])
        })

    return jsonify({
        "kpis": kpis,
        "monthlyData": monthly_data,
        "wealthData": wealth_data
    })
