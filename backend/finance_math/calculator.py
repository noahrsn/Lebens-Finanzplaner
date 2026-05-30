from datetime import datetime
from typing import List, Dict

def get_time_horizon(geburtsdatum: str, renteneintrittsalter: int) -> dict:
    """
    Berechnet aktuelles Alter, Jahre bis zur Rente und das Renteneintrittsjahr.
    :param geburtsdatum: str, erwartet im Format YYYY-MM-DD
    :param renteneintrittsalter: int
    :return: dict
    """
    geb_datum = datetime.strptime(geburtsdatum, "%Y-%m-%d")
    heute = datetime.now()
    aktuelles_alter = heute.year - geb_datum.year - ((heute.month, heute.day) < (geb_datum.month, geb_datum.day))
    jahre_bis_rente = renteneintrittsalter - aktuelles_alter
    renteneintrittsjahr = heute.year + jahre_bis_rente

    return {
        "aktuelles_alter": int(aktuelles_alter),
        "jahre_bis_rente": int(jahre_bis_rente),
        "renteneintrittsjahr": int(renteneintrittsjahr)
    }

def calc_monthly_cashflow(netto: float, fixkosten: float, variabel: float, sparraten_gesamt: float) -> dict:
    """
    Berechnet den monatlichen Überschuss und die Sparquote am Netto.
    """
    gesamt_ausgaben = fixkosten + variabel + sparraten_gesamt
    ueberschuss = netto - gesamt_ausgaben
    sparquote_prozent = (sparraten_gesamt / netto * 100) if netto > 0 else 0.0

    return {
        "gesamt_ausgaben": float(gesamt_ausgaben),
        "ueberschuss": float(ueberschuss),
        "sparquote_prozent": float(sparquote_prozent)
    }

def evaluate_emergency_fund(ruecklagen: float, fixkosten: float, variabel: float) -> dict:
    """
    Prüft, ob der Notgroschen 3 Monatsausgaben deckt.
    """
    monatliche_ausgaben = fixkosten + variabel
    ziel_ruecklage = monatliche_ausgaben * 3.0
    deckung_in_monaten = (ruecklagen / monatliche_ausgaben) if monatliche_ausgaben > 0 else 0.0
    ist_ausreichend = deckung_in_monaten >= 3.0

    return {
        "ist_ausreichend": bool(ist_ausreichend),
        "ziel_ruecklage": float(ziel_ruecklage),
        "deckung_in_monaten": float(deckung_in_monaten)
    }

def calc_net_worth(konten_und_vermoegenswerte: dict) -> float:
    """
    Summiert alle Werte im Dictionary 'konten_und_vermoegenswerte'.
    """
    return float(sum(konten_und_vermoegenswerte.values()))

def calc_statutory_pension(erwartete_punkte: float, rentenwert: float = 39.32) -> dict:
    """
    Berechnet die Bruttorente (Punkte * Rentenwert) und schätzt die Nettorente (ca. -20% für KV/PV/Steuern).
    """
    bruttorente = erwartete_punkte * rentenwert
    nettorente_schaetzung = bruttorente * 0.8

    return {
        "bruttorente": float(bruttorente),
        "nettorente_schaetzung": float(nettorente_schaetzung)
    }

def calc_pension_gap(wunschrente_heutig: float, erwartete_nettorente: float, inflation_prozent: float, jahre_bis_rente: int) -> dict:
    """
    Zinst die heutige Wunschrente mit der Inflation auf (Kaufkraftverlust ausgleichen) und zieht davon die erwartete Rente ab.
    """
    inflation_faktor = (1 + inflation_prozent / 100.0) ** jahre_bis_rente
    wunschrente_inflationsbereinigt = wunschrente_heutig * inflation_faktor
    rentenluecke = wunschrente_inflationsbereinigt - erwartete_nettorente
    if rentenluecke < 0:
        rentenluecke = 0.0

    return {
        "wunschrente_inflationsbereinigt": float(wunschrente_inflationsbereinigt),
        "rentenluecke": float(rentenluecke)
    }

def simulate_asset_growth(start_depot: float, start_tagesgeld: float, sparrate_depot: float, sparrate_tagesgeld: float, jahre: int, rendite_depot: float = 0.05, rendite_tagesgeld: float = 0.02) -> list[dict]:
    """
    Projiziert jährlich den Vermögensaufbau mit Zinseszins.
    """
    result = []
    depot_wert = start_depot
    tagesgeld_wert = start_tagesgeld

    for jahr in range(1, jahre + 1):
        depot_wert = depot_wert * (1.0 + rendite_depot) + (sparrate_depot * 12.0)
        tagesgeld_wert = tagesgeld_wert * (1.0 + rendite_tagesgeld) + (sparrate_tagesgeld * 12.0)

        result.append({
            "jahr": int(jahr),
            "depot_wert": float(depot_wert),
            "tagesgeld_wert": float(tagesgeld_wert),
            "gesamt_wert": float(depot_wert + tagesgeld_wert)
        })

    return result

def simulate_purchasing_power(startwert: float, inflation_prozent: float, jahre: int) -> list[dict]:
    """
    Berechnet die jährliche Entwertung des Startwertes.
    """
    result = []
    kaufkraft = startwert
    inflation_rate = inflation_prozent / 100.0

    for jahr in range(1, jahre + 1):
        kaufkraft = kaufkraft / (1.0 + inflation_rate)
        result.append({
            "jahr": int(jahr),
            "kaufkraft": float(kaufkraft)
        })

    return result

def evaluate_goals(ziele: list[dict], verfuegbarer_cashflow: float, aktuelles_jahr: int) -> list[dict]:
    """
    Iteriert über 'ziele_und_wuensche'. Berechnet für jedes Ziel, ob der 'aktueller_fortschritt' + ('zielbetrag' / Monate bis Ziel) durch den Cashflow gedeckt ist.
    """
    result = []
    rest_cashflow = verfuegbarer_cashflow

    for ziel in ziele:
        titel = ziel.get("titel", "Unbekanntes Ziel")
        zielbetrag = float(ziel.get("zielbetrag", 0.0))
        fortschritt = float(ziel.get("aktueller_fortschritt", 0.0))
        ziel_jahr = int(ziel.get("ziel_jahr", aktuelles_jahr + 1))

        monate_bis_ziel = (ziel_jahr - aktuelles_jahr) * 12
        if monate_bis_ziel <= 0:
            monate_bis_ziel = 1

        rest_betrag = zielbetrag - fortschritt
        if rest_betrag < 0:
            rest_betrag = 0.0

        benoetigte_monatsrate = rest_betrag / monate_bis_ziel

        if rest_cashflow >= benoetigte_monatsrate:
            status = "Unterstützt"
            rest_cashflow -= benoetigte_monatsrate
            deckungsgard_prozent = 100.0
        else:
            status = "Gefährdet"
            if benoetigte_monatsrate > 0:
                deckungsgard_prozent = max(0.0, (rest_cashflow / benoetigte_monatsrate) * 100.0)
                rest_cashflow = 0.0
            else:
                deckungsgard_prozent = 100.0

        result.append({
            "titel": str(titel),
            "status": str(status),
            "benoetigte_monatsrate": float(benoetigte_monatsrate),
            "deckungsgard_prozent": float(deckungsgard_prozent)
        })

    return result

def simulate_dynamic_cashflow(start_einkommen: float, start_ausgaben: float, life_events: list[dict], start_jahr: int, end_jahr: int) -> list[dict]:
    """
    Erstellt eine Zeitreihe. Berücksichtigt bei Erreichen eines 'eintrittsjahr' in 'life_events' die dauerhafte Anpassung von Einkommen und Ausgaben.
    """
    result = []
    akt_einkommen = start_einkommen
    akt_ausgaben = start_ausgaben

    events_sorted = sorted(life_events, key=lambda x: x.get("eintrittsjahr", start_jahr))
    event_idx = 0

    for jahr in range(start_jahr, end_jahr + 1):
        while event_idx < len(events_sorted) and events_sorted[event_idx].get("eintrittsjahr", start_jahr) == jahr:
            event = events_sorted[event_idx]
            akt_einkommen += float(event.get("einkommen_anpassung", 0.0))
            akt_ausgaben += float(event.get("ausgaben_anpassung", 0.0))
            event_idx += 1

        ueberschuss = akt_einkommen - akt_ausgaben
        result.append({
            "jahr": int(jahr),
            "einkommen_monatlich": float(akt_einkommen),
            "ausgaben_monatlich": float(akt_ausgaben),
            "ueberschuss": float(ueberschuss)
        })

    return result

def calc_fire_number(monatlicher_bedarf_netto: float, sichere_entnahmerate: float = 0.04) -> dict:
    """
    Berechnet das benötigte Gesamtkapital, um den monatlichen Bedarf theoretisch unendlich lange decken zu können.
    """
    jaehrlicher_bedarf = monatlicher_bedarf_netto * 12.0
    ziel_kapital = (jaehrlicher_bedarf / sichere_entnahmerate) if sichere_entnahmerate > 0 else 0.0
    
    return {
        "ziel_kapital": float(ziel_kapital),
        "monatliche_brutto_entnahme": float(jaehrlicher_bedarf / 12.0)
    }

def simulate_withdrawal_plan(startkapital: float, start_entnahme_monatlich: float, rendite_prozent: float, inflation_prozent: float, max_jahre: int = 50) -> list[dict]:
    """
    Simuliert den Kapitalverzehr im Alter (inklusive Rendite und Inflation).
    """
    result = []
    kapital = startkapital
    entnahme_monatlich = start_entnahme_monatlich
    rendite = rendite_prozent / 100.0 if rendite_prozent > 1.0 else rendite_prozent
    inflation = inflation_prozent / 100.0 if inflation_prozent > 1.0 else inflation_prozent
    
    for jahr in range(1, max_jahre + 1):
        if kapital <= 0:
            break
            
        jahres_entnahme = entnahme_monatlich * 12.0
        
        # Kapital verzinst sich (hier vereinfacht auf den Startwert des Jahres)
        kapital_vor_entnahme = kapital * (1.0 + rendite)
        kapital = kapital_vor_entnahme - jahres_entnahme
        
        if kapital < 0:
            jahres_entnahme += kapital  # Nur so viel entnehmen, wie noch da war
            kapital = 0.0
            
        result.append({
            "jahr": int(jahr),
            "alter": 67 + jahr - 1,  # Vereinfachte Annahme des Startalters (z.B. 67)
            "jahres_entnahme": float(jahres_entnahme),
            "restkapital": float(kapital)
        })
        
        entnahme_monatlich = entnahme_monatlich * (1.0 + inflation)
        
    return result

def simulate_mortgage(kreditsumme: float, sollzins_prozent: float, anfangs_tilgung_prozent: float, laufzeit_jahre: int = 35) -> list[dict]:
    """
    Berechnet den klassischen Tilgungsplan (Annuitätendarlehen).
    """
    result = []
    restschuld = kreditsumme
    zins = sollzins_prozent / 100.0
    tilgungsrate = anfangs_tilgung_prozent / 100.0
    
    jaehrliche_rate = kreditsumme * (zins + tilgungsrate)
    
    for jahr in range(1, laufzeit_jahre + 1):
        if restschuld <= 0:
            break
            
        zins_gezahlt = restschuld * zins
        tilgung_gezahlt = jaehrliche_rate - zins_gezahlt
        
        if tilgung_gezahlt > restschuld:
            tilgung_gezahlt = restschuld
            
        restschuld -= tilgung_gezahlt
        
        result.append({
            "jahr": int(jahr),
            "restschuld": float(restschuld),
            "zins_gezahlt_jahr": float(zins_gezahlt),
            "tilgung_gezahlt_jahr": float(tilgung_gezahlt)
        })
        
    return result

def calc_mortgage_rate(kreditsumme: float, sollzins_prozent: float, anfangs_tilgung_prozent: float) -> float:
    """
    Berechnet die monatliche fixe Rate (Annuität).
    """
    zins = sollzins_prozent / 100.0
    tilgungsrate = anfangs_tilgung_prozent / 100.0
    jaehrliche_rate = kreditsumme * (zins + tilgungsrate)
    return float(jaehrliche_rate / 12.0)

def calc_capital_gains_tax(entnahme_betrag: float, gewinn_anteil_prozent: float, freistellungsauftrag_rest: float = 1000.0) -> dict:
    """
    Berechnet deutsche Kapitalertragsteuer (~26,375%) auf die Gewinne einer Entnahme.
    """
    gewinn_anteil = gewinn_anteil_prozent / 100.0 if gewinn_anteil_prozent > 1.0 else gewinn_anteil_prozent
    gewinn = entnahme_betrag * gewinn_anteil
    
    genutzter_freibetrag = min(gewinn, freistellungsauftrag_rest)
    zu_versteuern = max(0.0, gewinn - genutzter_freibetrag)
    
    steuersatz = 0.26375  # 25% KapESt + 5,5% Soli
    steuerlast = zu_versteuern * steuersatz
    
    netto_auszahlung = entnahme_betrag - steuerlast
    
    return {
        "steuerlast": float(steuerlast),
        "netto_auszahlung": float(netto_auszahlung),
        "genutzter_freistellungsauftrag": float(genutzter_freibetrag)
    }

