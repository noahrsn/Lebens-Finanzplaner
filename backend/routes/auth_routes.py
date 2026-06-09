from flask import Blueprint, request, jsonify, session
from config import bcrypt
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from database.email_service import send_password_reset_email
from database.user_service import find_user_by_email, create_user, set_password_reset_token, update_password
from database.cosmos_service import query_items

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    vorname      = data.get("vorname",      "").strip()
    nachname     = data.get("nachname",     "").strip()
    geburtsdatum = data.get("geburtsdatum", "").strip()
    email        = data.get("email",        "").strip().lower()
    password     = data.get("password",     "")

    if not vorname or not nachname or not geburtsdatum or not email or not password:
        return jsonify({"error": "Alle Felder sind erforderlich."}), 400

    if len(password) < 6:
        return jsonify({"error": "Passwort muss mindestens 6 Zeichen haben."}), 400

    if find_user_by_email(email):
        return jsonify({"error": "Diese E-Mail-Adresse ist bereits registriert."}), 409

    create_user(vorname, nachname, geburtsdatum, email, password)

    return jsonify({"message": "Registrierung erfolgreich."}), 201


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email    = data.get("email",    "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "E-Mail und Passwort erforderlich."}), 400

    user = find_user_by_email(email)

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "E-Mail oder Passwort falsch."}), 401

    session["user_id"]      = user["id"]
    session["email"]        = user["email"]
    session["vorname"]      = user["vorname"]
    session["nachname"]     = user.get("nachname", "")
    session["geburtsdatum"] = user.get("geburtsdatum", "")

    return jsonify({
        "message": "Anmeldung erfolgreich.",
        "user": {
            "vorname":  user["vorname"],
            "nachname": user["nachname"],
            "email":    user["email"],
        }
    }), 200


@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Abgemeldet."}), 200

def _hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

@auth_bp.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "E-Mail erforderlich."}), 400

    user = find_user_by_email(email)

    # Always return the same response so attackers cannot check which emails exist.
    if user:
        token = secrets.token_urlsafe(32)
        token_hash = _hash_token(token)
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()

        set_password_reset_token(user, token_hash, expires_at)

        frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
        reset_url = f"{frontend_base_url}/passwort-zuruecksetzen?token={token}"

        send_password_reset_email(email, reset_url)

    return jsonify({
        "message": "Falls die E-Mail registriert ist, wurde ein Reset-Link versendet."
    }), 200


@auth_bp.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token", "")
    new_password = data.get("password", "")

    if not token or not new_password:
        return jsonify({"error": "Token und neues Passwort erforderlich."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Passwort muss mindestens 6 Zeichen haben."}), 400

    token_hash = _hash_token(token)

    query = "SELECT * FROM c WHERE c.passwordResetTokenHash = @tokenHash"
    params = [{"name": "@tokenHash", "value": token_hash}]
    users = query_items(query, parameters=params, container_name="users")

    if not users:
        return jsonify({"error": "Reset-Link ist ungültig oder abgelaufen."}), 400

    user = users[0]
    expires_at = datetime.fromisoformat(user["passwordResetExpiresAt"])

    if expires_at < datetime.now(timezone.utc):
        return jsonify({"error": "Reset-Link ist ungültig oder abgelaufen."}), 400

    update_password(user, new_password)

    return jsonify({"message": "Passwort wurde aktualisiert."}), 200
