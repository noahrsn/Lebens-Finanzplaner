import uuid
from .supabase_service import get_supabase_client
from config import bcrypt
from datetime import datetime, timezone

def find_user_by_email(email):
    """Search the users container for a document where email matches."""
    client = get_supabase_client()
    res = client.table("users").select("*").eq("data->>email", email).execute()
    if res.data:
        doc = res.data[0]["data"]
        doc["id"] = res.data[0]["id"]
        return doc
    return None

def create_user(vorname, nachname, geburtsdatum, email, password):
    """Save a new user document to Supabase."""
    client = get_supabase_client()
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "vorname": vorname,
        "nachname": nachname,
        "geburtsdatum": geburtsdatum,
        "email": email,
        "password": hashed
    }
    client.table("users").insert({"id": user_id, "data": new_user}).execute()

def get_all_users():
    """Return all users. (Dev only)"""
    client = get_supabase_client()
    res = client.table("users").select("data").execute()
    return [row["data"] for row in res.data]

def update_user(user):
    client = get_supabase_client()
    client.table("users").upsert({"id": user["id"], "data": user}).execute()
    return user

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
