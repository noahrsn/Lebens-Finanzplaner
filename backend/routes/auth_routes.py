from flask import Blueprint, request, jsonify, session
from config import bcrypt
from database.user_service import find_user_by_email, create_user

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

