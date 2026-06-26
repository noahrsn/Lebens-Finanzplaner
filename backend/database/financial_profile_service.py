from copy import deepcopy
from datetime import datetime, timezone
import uuid

from .supabase_service import get_supabase_client

PROFILE_TABLE = "financial_profiles"
GOALS_TABLE = "financial_goals"
LIFE_EVENTS_TABLE = "life_events"
CHANGE_LOG_TABLE = "profile_change_log"


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


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


def _number(value, default=0):
    return default if value is None else value


def _date_to_string(value):
    if value is None:
        return ""
    return str(value)


def _nested_get(data, path, default=None):
    current = data
    for key in path:
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current


def _column_or_data(row, column, data, path, default=0):
    if row.get(column) is not None:
        return _number(row.get(column), default)
    return _number(_nested_get(data, path, default), default)


def _nullable_uuid(value):
    if not value:
        return None
    try:
        return str(uuid.UUID(str(value)))
    except (TypeError, ValueError):
        return None


def _profile_user_id_from_row(row):
    data = row.get("data") if isinstance(row.get("data"), dict) else {}
    if row.get("user_id"):
        return row["user_id"]
    if data.get("userId"):
        return data["userId"]
    row_id = str(row.get("id", ""))
    if row_id.startswith("financial-profile:"):
        return row_id.split(":", 1)[1]
    return None


def _profile_snapshot(user_id, profile_id, profile_data, created_at, updated_at):
    data = deepcopy(profile_data)
    data["id"] = profile_id
    data["userId"] = user_id
    data["type"] = "financial_profile"
    data["createdAt"] = str(created_at or "")
    data["updatedAt"] = str(updated_at or "")
    return data


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
        validate_goal(goal)

    life_events = data["szenarien_und_simulationen"]["life_events"]
    if not isinstance(life_events, list):
        raise ValueError("life_events muss eine Liste sein.")
    for event in life_events:
        validate_life_event(event)


def validate_goal(goal_data):
    _require_mapping(goal_data, "Ziel")
    for field in ("titel", "zielbetrag", "aktueller_fortschritt", "zieldatum_jahr"):
        if field not in goal_data:
            raise ValueError(f"Ziel braucht das Feld {field}.")


def validate_life_event(event_data):
    _require_mapping(event_data, "Life Event")
    for field in (
        "ereignis_typ",
        "eintrittsjahr",
        "auswirkung_auf_ausgaben_monatlich",
        "auswirkung_auf_einkommen_monatlich",
    ):
        if field not in event_data:
            raise ValueError(f"Life Event braucht das Feld {field}.")


def _get_user(client, user_id):
    sql_user_id = _nullable_uuid(user_id)
    if not sql_user_id:
        return {}

    res = client.table("users").select("*").eq("id", sql_user_id).execute()
    if not res.data:
        return {}

    row = res.data[0]
    data = row.get("data") if isinstance(row.get("data"), dict) else {}
    user = {**data, "id": row.get("id")}
    for field in ("email", "password", "vorname", "nachname", "geburtsdatum"):
        value = row.get(field)
        if value not in (None, ""):
            user[field] = str(value) if field == "geburtsdatum" else value
    return user


def _profile_row_to_document(row, goals, life_events, user=None):
    user = user or {}
    data = row.get("data") if isinstance(row.get("data"), dict) else {}
    benutzer = data.get("benutzer") if isinstance(data.get("benutzer"), dict) else {}
    stored_goals = data.get("ziele_und_wuensche")
    stored_life_events = _nested_get(
        data,
        ("szenarien_und_simulationen", "life_events"),
        [],
    )

    if not goals and isinstance(stored_goals, list):
        goals = deepcopy(stored_goals)
    if not life_events and isinstance(stored_life_events, list):
        life_events = deepcopy(stored_life_events)

    return {
        "id": row["id"],
        "userId": row.get("user_id") or data.get("userId"),
        "type": "financial_profile",
        "createdAt": str(row.get("created_at") or data.get("createdAt") or ""),
        "updatedAt": str(row.get("updated_at") or data.get("updatedAt") or ""),
        "benutzer": {
            "email": user.get("email") or benutzer.get("email") or "",
            "name": user.get("nachname") or benutzer.get("name") or "",
            "vorname": user.get("vorname") or benutzer.get("vorname") or "",
            "geburtsdatum": _date_to_string(
                user.get("geburtsdatum") or benutzer.get("geburtsdatum")
            ),
        },
        "einnahmen_und_ausgaben": {
            "monatliches_netto_gehalt": _column_or_data(
                row,
                "monatliches_netto_gehalt",
                data,
                ("einnahmen_und_ausgaben", "monatliches_netto_gehalt"),
            ),
            "monatliche_fixkosten": _column_or_data(
                row,
                "monatliche_fixkosten",
                data,
                ("einnahmen_und_ausgaben", "monatliche_fixkosten"),
            ),
            "monatliche_variable_ausgaben": _column_or_data(
                row,
                "monatliche_variable_ausgaben",
                data,
                ("einnahmen_und_ausgaben", "monatliche_variable_ausgaben"),
            ),
            "sparraten": {
                "gesamt_monatlich": _column_or_data(
                    row,
                    "sparrate_gesamt_monatlich",
                    data,
                    ("einnahmen_und_ausgaben", "sparraten", "gesamt_monatlich"),
                ),
                "aufteilung": {
                    "depot": _column_or_data(
                        row,
                        "sparrate_depot",
                        data,
                        ("einnahmen_und_ausgaben", "sparraten", "aufteilung", "depot"),
                    ),
                    "tagesgeld": _column_or_data(
                        row,
                        "sparrate_tagesgeld",
                        data,
                        ("einnahmen_und_ausgaben", "sparraten", "aufteilung", "tagesgeld"),
                    ),
                },
            },
        },
        "altersvorsorge": {
            "geplantes_renteneintrittsalter": _column_or_data(
                row,
                "geplantes_renteneintrittsalter",
                data,
                ("altersvorsorge", "geplantes_renteneintrittsalter"),
            ),
            "aktuelle_rentenpunkte": _column_or_data(
                row,
                "aktuelle_rentenpunkte",
                data,
                ("altersvorsorge", "aktuelle_rentenpunkte"),
            ),
            "erwartete_rentenpunkte_bei_eintritt": _column_or_data(
                row,
                "erwartete_rentenpunkte_bei_eintritt",
                data,
                ("altersvorsorge", "erwartete_rentenpunkte_bei_eintritt"),
            ),
        },
        "konten_und_vermoegenswerte": {
            "girokonto_stand": _column_or_data(
                row,
                "girokonto_stand",
                data,
                ("konten_und_vermoegenswerte", "girokonto_stand"),
            ),
            "tagesgeld_stand": _column_or_data(
                row,
                "tagesgeld_stand",
                data,
                ("konten_und_vermoegenswerte", "tagesgeld_stand"),
            ),
            "ruecklagen": _column_or_data(
                row,
                "ruecklagen",
                data,
                ("konten_und_vermoegenswerte", "ruecklagen"),
            ),
            "depot_wertpapiere": _column_or_data(
                row,
                "depot_wertpapiere",
                data,
                ("konten_und_vermoegenswerte", "depot_wertpapiere"),
            ),
            "versicherungsvertraege_wert": _column_or_data(
                row,
                "versicherungsvertraege_wert",
                data,
                ("konten_und_vermoegenswerte", "versicherungsvertraege_wert"),
            ),
        },
        "ziele_und_wuensche": goals,
        "szenarien_und_simulationen": {
            "angenommene_inflation_prozent": _column_or_data(
                row,
                "angenommene_inflation_prozent",
                data,
                ("szenarien_und_simulationen", "angenommene_inflation_prozent"),
                2.0,
            ),
            "life_events": life_events,
        },
    }


def _profile_data_to_row(user_id, profile_data, existing=None):
    timestamp = _now_iso()
    existing = existing or {}
    profile_id = existing.get("id") or _profile_id(user_id)
    created_at = existing.get("created_at") or _nested_get(
        existing.get("data") if isinstance(existing.get("data"), dict) else {},
        ("createdAt",),
        timestamp,
    )
    e_a = profile_data["einnahmen_und_ausgaben"]
    sparraten = e_a["sparraten"]
    aufteilung = sparraten["aufteilung"]
    altersvorsorge = profile_data["altersvorsorge"]
    konten = profile_data["konten_und_vermoegenswerte"]
    szenarien = profile_data["szenarien_und_simulationen"]

    return {
        "id": profile_id,
        "data": _profile_snapshot(user_id, profile_id, profile_data, created_at, timestamp),
        "user_id": _nullable_uuid(user_id),
        "monatliches_netto_gehalt": e_a["monatliches_netto_gehalt"],
        "monatliche_fixkosten": e_a["monatliche_fixkosten"],
        "monatliche_variable_ausgaben": e_a["monatliche_variable_ausgaben"],
        "sparrate_gesamt_monatlich": sparraten["gesamt_monatlich"],
        "sparrate_depot": aufteilung.get("depot", 0),
        "sparrate_tagesgeld": aufteilung.get("tagesgeld", 0),
        "geplantes_renteneintrittsalter": altersvorsorge["geplantes_renteneintrittsalter"],
        "aktuelle_rentenpunkte": altersvorsorge["aktuelle_rentenpunkte"],
        "erwartete_rentenpunkte_bei_eintritt": altersvorsorge["erwartete_rentenpunkte_bei_eintritt"],
        "girokonto_stand": konten["girokonto_stand"],
        "tagesgeld_stand": konten["tagesgeld_stand"],
        "ruecklagen": konten["ruecklagen"],
        "depot_wertpapiere": konten["depot_wertpapiere"],
        "versicherungsvertraege_wert": konten["versicherungsvertraege_wert"],
        "angenommene_inflation_prozent": szenarien["angenommene_inflation_prozent"],
        "created_at": created_at,
        "updated_at": timestamp,
    }


def _goal_row_to_document(row):
    return {
        "id": row["id"],
        "titel": row.get("titel", ""),
        "zielbetrag": _number(row.get("zielbetrag")),
        "aktueller_fortschritt": _number(row.get("aktueller_fortschritt")),
        "zieldatum_jahr": row.get("zieldatum_jahr"),
    }


def _goal_data_to_row(profile_id, goal_data):
    timestamp = _now_iso()
    return {
        "id": goal_data.get("id") or str(uuid.uuid4()),
        "profile_id": profile_id,
        "titel": goal_data["titel"],
        "zielbetrag": goal_data["zielbetrag"],
        "aktueller_fortschritt": goal_data["aktueller_fortschritt"],
        "zieldatum_jahr": goal_data["zieldatum_jahr"],
        "updated_at": timestamp,
    }


def _life_event_row_to_document(row):
    return {
        "id": row["id"],
        "ereignis_typ": row.get("ereignis_typ", ""),
        "eintrittsjahr": row.get("eintrittsjahr"),
        "auswirkung_auf_ausgaben_monatlich": _number(row.get("auswirkung_auf_ausgaben_monatlich")),
        "auswirkung_auf_einkommen_monatlich": _number(row.get("auswirkung_auf_einkommen_monatlich")),
    }


def _life_event_data_to_row(profile_id, event_data):
    timestamp = _now_iso()
    return {
        "id": event_data.get("id") or str(uuid.uuid4()),
        "profile_id": profile_id,
        "ereignis_typ": event_data["ereignis_typ"],
        "eintrittsjahr": event_data["eintrittsjahr"],
        "auswirkung_auf_ausgaben_monatlich": event_data["auswirkung_auf_ausgaben_monatlich"],
        "auswirkung_auf_einkommen_monatlich": event_data["auswirkung_auf_einkommen_monatlich"],
        "updated_at": timestamp,
    }


def _get_profile_row(client, user_id):
    res = client.table(PROFILE_TABLE).select("*").eq("id", _profile_id(user_id)).execute()
    if res.data:
        return res.data[0]

    sql_user_id = _nullable_uuid(user_id)
    if sql_user_id:
        res = client.table(PROFILE_TABLE).select("*").eq("user_id", sql_user_id).execute()
        if res.data:
            return res.data[0]

    return None


def _get_goals(client, profile_id):
    res = client.table(GOALS_TABLE).select("*").eq("profile_id", profile_id).execute()
    return [_goal_row_to_document(row) for row in (res.data or [])]


def _get_life_events(client, profile_id):
    res = client.table(LIFE_EVENTS_TABLE).select("*").eq("profile_id", profile_id).execute()
    return [_life_event_row_to_document(row) for row in (res.data or [])]


def _replace_goals(client, profile_id, goals):
    client.table(GOALS_TABLE).delete().eq("profile_id", profile_id).execute()
    rows = [_goal_data_to_row(profile_id, goal) for goal in goals]
    if rows:
        client.table(GOALS_TABLE).insert(rows).execute()


def _replace_life_events(client, profile_id, life_events):
    client.table(LIFE_EVENTS_TABLE).delete().eq("profile_id", profile_id).execute()
    rows = [_life_event_data_to_row(profile_id, event) for event in life_events]
    if rows:
        client.table(LIFE_EVENTS_TABLE).insert(rows).execute()


def _refresh_profile_data_snapshot(client, profile_id, user_id):
    res = client.table(PROFILE_TABLE).select("*").eq("id", profile_id).execute()
    if not res.data:
        return None

    timestamp = _now_iso()
    row = {**res.data[0], "updated_at": timestamp}
    user = _get_user(client, row.get("user_id") or user_id)
    goals = _get_goals(client, profile_id)
    life_events = _get_life_events(client, profile_id)
    document = _profile_row_to_document(row, goals, life_events, user)
    client.table(PROFILE_TABLE).update(
        {"data": document, "updated_at": timestamp}
    ).eq("id", profile_id).execute()
    return document


def get_financial_profile(user_id):
    client = get_supabase_client()
    row = _get_profile_row(client, user_id)
    if not row:
        return None

    user = _get_user(client, row.get("user_id") or user_id)
    goals = _get_goals(client, row["id"])
    life_events = _get_life_events(client, row["id"])
    return _profile_row_to_document(row, goals, life_events, user)


def save_financial_profile(user_id, profile_data):
    validate_financial_profile(profile_data)

    client = get_supabase_client()
    existing = _get_profile_row(client, user_id)
    row = _profile_data_to_row(user_id, profile_data, existing)

    result = client.table(PROFILE_TABLE).upsert(row).execute()
    saved = result.data[0] if result.data else row
    _replace_goals(client, saved["id"], profile_data.get("ziele_und_wuensche", []))
    _replace_life_events(
        client,
        saved["id"],
        profile_data.get("szenarien_und_simulationen", {}).get("life_events", []),
    )
    _refresh_profile_data_snapshot(client, saved["id"], user_id)

    return get_financial_profile(user_id)


def patch_financial_profile_section(user_id, section_name, section_data):
    if section_name not in PROFILE_SECTIONS:
        raise ValueError("Unbekannter Profilbereich.")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    updated = {section: profile.get(section) for section in PROFILE_SECTIONS}
    updated[section_name] = section_data
    return save_financial_profile(user_id, updated)


def _collect_changes(old, new, prefix=""):
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


def _write_change_log(client, profile_id, changes):
    if not changes:
        return

    timestamp = _now_iso()
    rows = [
        {
            "id": str(uuid.uuid4()),
            "profile_id": profile_id,
            "changed_at": timestamp,
            "field_path": change["field"],
            "old_value": change["old"],
            "new_value": change["new"],
        }
        for change in changes
    ]
    try:
        client.table(CHANGE_LOG_TABLE).insert(rows).execute()
    except Exception as exc:
        print(f"Change log skipped: {exc}")


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

    profile = save_financial_profile(user_id, merged)
    client = get_supabase_client()
    _write_change_log(client, profile["id"], changes)
    return profile


def add_goal(user_id, goal_data):
    validate_goal(goal_data)

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    goal = {"id": str(uuid.uuid4()), **goal_data}
    client = get_supabase_client()
    client.table(GOALS_TABLE).insert(_goal_data_to_row(profile["id"], goal)).execute()
    _refresh_profile_data_snapshot(client, profile["id"], user_id)
    return goal


def update_goal(user_id, goal_id, goal_data):
    _require_mapping(goal_data, "Ziel")

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    existing_goals = list(profile.get("ziele_und_wuensche", []))
    existing = next((goal for goal in existing_goals if goal.get("id") == goal_id), None)
    if not existing:
        raise LookupError("Ziel nicht gefunden.")

    updated_goal = {**existing}
    for field in ("titel", "zielbetrag", "aktueller_fortschritt", "zieldatum_jahr"):
        if field in goal_data:
            updated_goal[field] = goal_data[field]

    validate_goal(updated_goal)

    client = get_supabase_client()
    client.table(GOALS_TABLE).update(_goal_data_to_row(profile["id"], updated_goal)).eq("id", goal_id).execute()
    _refresh_profile_data_snapshot(client, profile["id"], user_id)
    return updated_goal


def delete_goal(user_id, goal_id):
    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    if not any(goal.get("id") == goal_id for goal in profile.get("ziele_und_wuensche", [])):
        raise LookupError("Ziel nicht gefunden.")

    client = get_supabase_client()
    client.table(GOALS_TABLE).delete().eq("id", goal_id).eq("profile_id", profile["id"]).execute()
    _refresh_profile_data_snapshot(client, profile["id"], user_id)
    return {"id": goal_id, "deleted": True}


def add_life_event(user_id, event_data):
    validate_life_event(event_data)

    profile = get_financial_profile(user_id)
    if not profile:
        raise LookupError("Finanzprofil wurde noch nicht angelegt.")

    event = {"id": str(uuid.uuid4()), **event_data}
    client = get_supabase_client()
    client.table(LIFE_EVENTS_TABLE).insert(_life_event_data_to_row(profile["id"], event)).execute()
    _refresh_profile_data_snapshot(client, profile["id"], user_id)
    return event


def normalize_financial_profile_row(client, row):
    data = row.get("data") if isinstance(row.get("data"), dict) else None
    if not data:
        return None

    validate_financial_profile(data)
    user_id = str(_profile_user_id_from_row(row) or "")
    normalized = _profile_data_to_row(user_id, data, row)
    result = client.table(PROFILE_TABLE).upsert(normalized).execute()
    saved = result.data[0] if result.data else normalized
    profile_id = saved["id"]

    _replace_goals(client, profile_id, data.get("ziele_und_wuensche", []))
    _replace_life_events(
        client,
        profile_id,
        data.get("szenarien_und_simulationen", {}).get("life_events", []),
    )
    _refresh_profile_data_snapshot(client, profile_id, user_id)
    return profile_id
