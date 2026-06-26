from datetime import datetime, timezone
import uuid

from database.financial_profile_service import (
    GOALS_TABLE,
    LIFE_EVENTS_TABLE,
    PROFILE_TABLE,
    validate_goal,
    validate_life_event,
)
from database.supabase_service import get_supabase_client


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _uuid_or_new(value):
    if value:
        try:
            return str(uuid.UUID(str(value)))
        except (TypeError, ValueError):
            pass
    return str(uuid.uuid4())


def _get_profile_children(row):
    data = row.get("data")
    if not isinstance(data, dict):
        return None, None

    goals = data.get("ziele_und_wuensche", [])
    simulations = data.get("szenarien_und_simulationen", {})
    life_events = simulations.get("life_events", []) if isinstance(simulations, dict) else []

    if not isinstance(goals, list):
        raise ValueError("ziele_und_wuensche muss eine Liste sein.")
    if not isinstance(life_events, list):
        raise ValueError("life_events muss eine Liste sein.")

    return goals, life_events


def _goal_to_row(profile_id, goal):
    validate_goal(goal)
    return {
        "id": _uuid_or_new(goal.get("id")),
        "profile_id": profile_id,
        "titel": goal["titel"],
        "zielbetrag": goal["zielbetrag"],
        "aktueller_fortschritt": goal["aktueller_fortschritt"],
        "zieldatum_jahr": goal["zieldatum_jahr"],
        "updated_at": _now_iso(),
    }


def _life_event_to_row(profile_id, event):
    validate_life_event(event)
    return {
        "id": _uuid_or_new(event.get("id")),
        "profile_id": profile_id,
        "ereignis_typ": event["ereignis_typ"],
        "eintrittsjahr": event["eintrittsjahr"],
        "auswirkung_auf_ausgaben_monatlich": event["auswirkung_auf_ausgaben_monatlich"],
        "auswirkung_auf_einkommen_monatlich": event["auswirkung_auf_einkommen_monatlich"],
        "updated_at": _now_iso(),
    }


def _replace_child_rows(client, profile_id, goals, life_events):
    goal_rows = [_goal_to_row(profile_id, goal) for goal in goals]
    life_event_rows = [_life_event_to_row(profile_id, event) for event in life_events]

    client.table(GOALS_TABLE).delete().eq("profile_id", profile_id).execute()
    if goal_rows:
        client.table(GOALS_TABLE).insert(goal_rows).execute()

    client.table(LIFE_EVENTS_TABLE).delete().eq("profile_id", profile_id).execute()
    if life_event_rows:
        client.table(LIFE_EVENTS_TABLE).insert(life_event_rows).execute()

    return len(goal_rows), len(life_event_rows)


def _migrate_child_tables(client):
    result = client.table(PROFILE_TABLE).select("id,data").execute()
    processed_profiles = 0
    skipped_profiles = 0
    inserted_goals = 0
    inserted_life_events = 0
    errors = []

    for row in result.data or []:
        profile_id = row.get("id")
        if not profile_id:
            errors.append(("<missing profile id>", "Profil hat keine id."))
            continue

        try:
            goals, life_events = _get_profile_children(row)
            if goals is None:
                skipped_profiles += 1
                continue

            goal_count, life_event_count = _replace_child_rows(
                client,
                profile_id,
                goals,
                life_events,
            )
            processed_profiles += 1
            inserted_goals += goal_count
            inserted_life_events += life_event_count
        except Exception as exc:
            errors.append((profile_id, str(exc)))

    return processed_profiles, skipped_profiles, inserted_goals, inserted_life_events, errors


def main():
    client = get_supabase_client()

    (
        processed_profiles,
        skipped_profiles,
        inserted_goals,
        inserted_life_events,
        errors,
    ) = _migrate_child_tables(client)

    print(f"Financial profiles processed: {processed_profiles}")
    print(f"Financial profiles skipped: {skipped_profiles}")
    print(f"Financial goals inserted: {inserted_goals}")
    print(f"Life events inserted: {inserted_life_events}")

    for profile_id, error in errors:
        print(f"Child-table migration failed for {profile_id}: {error}")

    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
