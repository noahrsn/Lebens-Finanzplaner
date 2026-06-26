import uuid
from .supabase_service import get_supabase_client
from config import bcrypt
from datetime import datetime, timezone


USER_TABLE = "users"


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _normalize_date(value):
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return text

    for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(text, date_format).date().isoformat()
        except ValueError:
            pass

    return text


def _row_to_user(row):
    """Build the API user document from SQL columns plus the JSON snapshot."""
    data = row.get("data") if isinstance(row.get("data"), dict) else {}
    user = {**data}
    user["id"] = row.get("id") or user.get("id")

    for field in ("email", "password", "vorname", "nachname", "geburtsdatum"):
        value = row.get(field)
        if value not in (None, ""):
            user[field] = str(value) if field == "geburtsdatum" else value

    for field in (
        "passwordResetTokenHash",
        "passwordResetExpiresAt",
        "createdAt",
        "updatedAt",
    ):
        if row.get(field) is not None:
            user[field] = row.get(field)

    return user


def _user_to_row(user):
    """Parse the user JSON document into the SQL structure from database.txt."""
    timestamp = _now_iso()
    user_id = user.get("id") or str(uuid.uuid4())
    created_at = user.get("createdAt") or timestamp
    updated_at = timestamp
    geburtsdatum = _normalize_date(user.get("geburtsdatum"))

    data = {
        **user,
        "id": user_id,
        "email": user.get("email", ""),
        "password": user.get("password", ""),
        "vorname": user.get("vorname", ""),
        "nachname": user.get("nachname", ""),
        "geburtsdatum": geburtsdatum,
        "createdAt": created_at,
        "updatedAt": updated_at,
    }

    for nullable_field in ("passwordResetTokenHash", "passwordResetExpiresAt"):
        if user.get(nullable_field) is None:
            data.pop(nullable_field, None)
        else:
            data[nullable_field] = user.get(nullable_field)

    return {
        "id": user_id,
        "data": data,
        "email": data["email"],
        "password": data["password"],
        "vorname": data["vorname"],
        "nachname": data["nachname"],
        "geburtsdatum": geburtsdatum,
        "passwordResetTokenHash": user.get("passwordResetTokenHash"),
        "passwordResetExpiresAt": user.get("passwordResetExpiresAt"),
        "createdAt": created_at,
        "updatedAt": updated_at,
    }


def normalize_user_row(row):
    return _user_to_row(_row_to_user(row))

def find_user_by_email(email):
    """Search the users table for a row where email matches."""
    client = get_supabase_client()
    res = client.table(USER_TABLE).select("*").eq("email", email).execute()
    if not res.data:
        res = client.table(USER_TABLE).select("*").eq("data->>email", email).execute()
    if res.data:
        return _row_to_user(res.data[0])
    return None

def create_user(vorname, nachname, geburtsdatum, email, password):
    """Save a new user row to Supabase."""
    client = get_supabase_client()
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = {
        "vorname": vorname,
        "nachname": nachname,
        "geburtsdatum": geburtsdatum,
        "email": email,
        "password": hashed
    }
    client.table(USER_TABLE).insert(_user_to_row(new_user)).execute()

def get_all_users():
    """Return all users. (Dev only)"""
    client = get_supabase_client()
    res = client.table(USER_TABLE).select("*").execute()
    return [_row_to_user(row) for row in (res.data or [])]

def update_user(user):
    client = get_supabase_client()
    row = _user_to_row(user)
    client.table(USER_TABLE).upsert(row).execute()
    return _row_to_user(row)

def find_user_by_reset_token_hash(token_hash):
    client = get_supabase_client()
    res = (
        client.table(USER_TABLE)
        .select("*")
        .eq("passwordResetTokenHash", token_hash)
        .execute()
    )
    if not res.data:
        res = (
            client.table(USER_TABLE)
            .select("*")
            .eq("data->>passwordResetTokenHash", token_hash)
            .execute()
        )
    if not res.data:
        return None
    return _row_to_user(res.data[0])

def set_password_reset_token(user, token_hash, expires_at):
    user["passwordResetTokenHash"] = token_hash
    user["passwordResetExpiresAt"] = expires_at
    return update_user(user)

def clear_password_reset_token(user):
    user.pop("passwordResetTokenHash", None)
    user.pop("passwordResetExpiresAt", None)
    return update_user(user)

def update_password(user, new_password):
    user["password"] = bcrypt.generate_password_hash(new_password).decode("utf-8")
    user.pop("passwordResetTokenHash", None)
    user.pop("passwordResetExpiresAt", None)
    return update_user(user)
