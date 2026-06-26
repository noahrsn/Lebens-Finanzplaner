from database.financial_profile_service import (
    PROFILE_TABLE,
    normalize_financial_profile_row,
)
from database.supabase_service import get_supabase_client
from database.user_service import USER_TABLE, normalize_user_row


def _migrate_users(client):
    result = client.table(USER_TABLE).select("*").execute()
    migrated = 0
    errors = []

    for row in result.data or []:
        try:
            client.table(USER_TABLE).upsert(normalize_user_row(row)).execute()
            migrated += 1
        except Exception as exc:
            errors.append((row.get("id"), str(exc)))

    return migrated, errors


def _migrate_financial_profiles(client):
    result = client.table(PROFILE_TABLE).select("*").execute()
    migrated = 0
    skipped = 0
    errors = []

    for row in result.data or []:
        try:
            profile_id = normalize_financial_profile_row(client, row)
            if profile_id:
                migrated += 1
            else:
                skipped += 1
        except Exception as exc:
            errors.append((row.get("id"), str(exc)))

    return migrated, skipped, errors


def main():
    client = get_supabase_client()

    users_migrated, user_errors = _migrate_users(client)
    profiles_migrated, profiles_skipped, profile_errors = _migrate_financial_profiles(client)

    print(f"Users migrated: {users_migrated}")
    print(f"Financial profiles migrated: {profiles_migrated}")
    print(f"Financial profiles skipped: {profiles_skipped}")

    for row_id, error in user_errors:
        print(f"User migration failed for {row_id}: {error}")
    for row_id, error in profile_errors:
        print(f"Profile migration failed for {row_id}: {error}")

    if user_errors or profile_errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
