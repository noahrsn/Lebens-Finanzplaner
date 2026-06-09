import uuid
from .cosmos_service import query_items, write_item
from config import bcrypt
from datetime import datetime, timezone

def find_user_by_email(email):
    """Search the users container for a document where email matches."""
    query = "SELECT * FROM c WHERE c.email = @email"
    params = [{"name": "@email", "value": email}]
    results = query_items(query, parameters=params, container_name="users")
    return results[0] if results else None

def create_user(vorname, nachname, geburtsdatum, email, password):
    """Save a new user document to Cosmos DB."""
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = {
        "id": str(uuid.uuid4()),
        "vorname": vorname,
        "nachname": nachname,
        "geburtsdatum": geburtsdatum,
        "email": email,
        "password": hashed
    }
    write_item(new_user, container_name="users")

def get_all_users():
    """Return all users. (Dev only)"""
    query = "SELECT c.id, c.vorname, c.nachname, c.email FROM c"
    return query_items(query, container_name="users")

def update_user(user):
    return write_item(user, container_name="users")

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
