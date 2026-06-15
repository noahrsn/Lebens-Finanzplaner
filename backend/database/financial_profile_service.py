from copy import deepcopy
from datetime import datetime, timezone
import uuid

from .supabase_service import get_supabase_client

CONTAINER_NAME = "financial_profiles"

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

# dummy data
_MEMORY_DB = {
    "financial-profile:test-user-id": {
        "id": "financial-profile:test-user-id",
        "userId": "test-user-id",
        "type": "financial_profile",
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
        "benutzer": {
            "email": "test@example.com",
            "name": "User",
            "vorname": "Test",
            "geburtsdatum": "1990-01-01"
        },
        "einnahmen_und_ausgaben": {
            "monatliches_netto_gehalt": 3200,
            "monatliche_fixkosten": 1500,
            "monatliche_variable_ausgaben": 600,
            "sparraten": {
                "gesamt_monatlich": 1100,
                "aufteilung": {"tagesgeld": 600, "depot": 500}
            }
        },
        "altersvorsorge": {
            "geplantes_renteneintrittsalter": 67,
            "aktuelle_rentenpunkte": 0,
            "erwartete_rentenpunkte_bei_eintritt": 40
        },
        "konten_und_vermoegenswerte": {
            "girokonto_stand": 2000,
            "tagesgeld_stand": 6000,
            "ruecklagen": 0,
            "depot_wertpapiere": 18650,
            "versicherungsvertraege_wert": 0
        },
        "ziele_und_wuensche": [],
        "szenarien_und_simulationen": {
            "angenommene_inflation_prozent": 2.0,
            "life_events": []
        }
    }
}

PROFILE_SECTIONS = (
    "benutzer",
    "einnahmen_und_ausgaben",
    "altersvorsorge",
    "konten_und_vermoegenswerte",
    "ziele_und_wuensche",
    "szenarien_und_simulationen",
)

REQUIRED_SECTION_FIELDS = {
    "benutzer": ("email", "name", "vorname", "geburtsdatum"),
    "einnahmen_und_ausgaben": (
        "monatliches_netto_gehalt",
        "monatliche_fixkosten",
        "monatliche_variable_ausgaben",
        "sparraten",
    ),
    "altersvorsorge": (
        "geplantes_renteneintrittsalter",
        "aktuelle_rentenpunkte",
        "erwartete_rentenpunkte_bei_eintritt",
    ),
    "konten_und_vermoegenswerte": (
        "girokonto_stand",
        "tagesgeld_stand",
        "ruecklagen",
        "depot_wertpapiere",
        "versicherungsvertraege_wert",
    ),
    "szenarien_und_simulationen": ("angenommene_inflation_prozent", "life_events"),
}


def _profile_id(user_id):
    return f"financial-profile:{user_id}"


def _require_mapping(data, field_name):
    if not isinstance(data, dict):
        raise ValueError(f"{field_name} muss ein Objekt sein.")


def validate_financial_profile(data):
    _require_mapping(data, "Profil")

    missing_sections = [section for section in PROFILE_SECTIONS if section not in data]
    if missing_sections:
        raise ValueError(f"Fehlende Bereiche: {', '.join(missing_sections)}.")

    for section, fields in REQUIRED_SECTION_FIELDS.items():
        _require_mapping(data.get(section), section)
        missing_fields = [field for field in fields if field not in data[section]]
        if missing_fields:
            raise ValueError(
                f"Fehlende Felder in {section}: {', '.join(missing_fields)}."
            )

    sparraten = data["einnahmen_und_ausgaben"]["sparraten"]
    _require_mapping(sparraten, "sparraten")
    if "gesamt_monatlich" not in sparraten or "aufteilung" not in sparraten:
        raise ValueError("sparraten braucht gesamt_monatlich und aufteilung.")
    _require_mapping(sparraten["aufteilung"], "sparraten.aufteilung")

    goals = data["ziele_und_wuensche"]
    if not isinstance(goals, list):
        raise ValueError("ziele_und_wuensche muss eine Liste sein.")
    for goal in goals:
        _require_mapping(goal, "Ziel")
        for field in ("titel", "zielbetrag", "aktueller_fortschritt", "zieldatum_jahr"):
            if field not in goal:
                raise ValueError(f"Ziel braucht das Feld {field}.")

    life_events = data["szenarien_und_simulationen"]["life_events"]
    if not isinstance(life_events, list):
        raise ValueError("life_events muss eine Liste sein.")
    for event in life_events:
        _require_mapping(event, "Life Event")
        for field in (
            "ereignis_typ",
            "eintrittsjahr",
            "auswirkung_auf_ausgaben_monatlich",
            "auswirkung_auf_einkommen_monatlich",
        ):
            if field not in event:
                raise ValueError(f"Life Event braucht das Feld {field}.")


def get_financial_profile(user_id):
    client = get_supabase_client()
    res = client.table(CONTAINER_NAME).select("*").eq("id", _profile_id(user_id)).execute()
    if res.data:
        doc = res.data[0]["data"]
        doc["id"] = res.data[0]["id"]
        return doc
    return None


def save_financial_profile(user_id, profile_data):
    validate_financial_profile(profile_data)

    existing = get_financial_profile(user_id)
    timestamp = _now_iso()
    doc_id = existing["id"] if existing else _profile_id(user_id)
    document = {
        "id": doc_id,
        "userId": user_id,
        "type": "financial_profile",
        "createdAt": existing.get("createdAt", timestamp) if existing else timestamp,
        "updatedAt": timestamp,
        **deepcopy(profile_data),
    }

    client = get_supabase_client()
    client.table(CONTAINER_NAME).upsert({"id": doc_id, "data": document}).execute()
    return document


def patch_financial_profile_section(user_id, section_name, section_data):
    if section_name not in PROFILE_SECTIONS:
        raise ValueError("Unbekannter Profilbereich.")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    updated = {section: profile.get(section) for section in PROFILE_SECTIONS}
    updated[section_name] = section_data
    return save_financial_profile(user_id, updated)


def _collect_changes(old, new, prefix=''):
    changes = []
    if not isinstance(new, dict) or not isinstance(old, dict):
        if old != new:
            changes.append({"field": prefix, "old": old, "new": new})
        return changes
    for key, new_val in new.items():
        full_key = f"{prefix}.{key}" if prefix else key
        old_val = old.get(key)
        changes.extend(_collect_changes(old_val, new_val, full_key))
    return changes


def update_financial_profile_with_log(user_id, updated_sections):
    existing = get_financial_profile(user_id)
    if not existing:
        raise LookupError("Finanzprofil nicht gefunden.")

    merged = deepcopy(existing)
    for section in PROFILE_SECTIONS:
        if section in updated_sections:
            merged[section] = updated_sections[section]

    validate_financial_profile(merged)

    changes = []
    for section in PROFILE_SECTIONS:
        if section in updated_sections:
            changes.extend(
                _collect_changes(existing.get(section, {}), updated_sections[section], section)
            )

    if changes:
        log = list(merged.get("change_log", []))
        log.append({"timestamp": _now_iso(), "changes": changes})
        merged["change_log"] = log

    merged["updatedAt"] = _now_iso()

    return merged


def add_goal(user_id, goal_data):
    _require_mapping(goal_data, "Ziel")
    for field in ("titel", "zielbetrag", "aktueller_fortschritt", "zieldatum_jahr"):
        if field not in goal_data:
            raise ValueError(f"Ziel braucht das Feld {field}.")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    goal = {"id": str(uuid.uuid4()), **goal_data}
    goals = list(profile.get("ziele_und_wuensche", []))
    goals.append(goal)
    patch_financial_profile_section(user_id, "ziele_und_wuensche", goals)
    return goal


def update_goal(user_id, goal_id, goal_data):
    _require_mapping(goal_data, "Ziel")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    goals = list(profile.get("ziele_und_wuensche", []))
    index = next((i for i, g in enumerate(goals) if g.get("id") == goal_id), None)
    if index is None:
        raise LookupError("Ziel nicht gefunden.")

    updated_goal = {**goals[index]}
    for field in ("titel", "zielbetrag", "aktueller_fortschritt", "zieldatum_jahr"):
        if field in goal_data:
            updated_goal[field] = goal_data[field]
    goals[index] = updated_goal

    patch_financial_profile_section(user_id, "ziele_und_wuensche", goals)
    return updated_goal


def delete_goal(user_id, goal_id):
    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    goals = list(profile.get("ziele_und_wuensche", []))
    remaining = [g for g in goals if g.get("id") != goal_id]
    if len(remaining) == len(goals):
        raise LookupError("Ziel nicht gefunden.")

    patch_financial_profile_section(user_id, "ziele_und_wuensche", remaining)
    return {"id": goal_id, "deleted": True}


def add_life_event(user_id, event_data):
    _require_mapping(event_data, "Life Event")
    for field in (
        "ereignis_typ",
        "eintrittsjahr",
        "auswirkung_auf_ausgaben_monatlich",
        "auswirkung_auf_einkommen_monatlich",
    ):
        if field not in event_data:
            raise ValueError(f"Life Event braucht das Feld {field}.")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    event = {"id": str(uuid.uuid4()), **event_data}
    simulations = deepcopy(profile.get("szenarien_und_simulationen", {}))
    life_events = list(simulations.get("life_events", []))
    life_events.append(event)
    simulations["life_events"] = life_events
    patch_financial_profile_section(user_id, "szenarien_und_simulationen", simulations)
    return event

