import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from config import bcrypt, find_user_by_email, create_user
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(32))

# Allow the React dev server (port 5173/5174) to talk to Flask
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
])

# Tell bcrypt which app it belongs to
bcrypt.init_app(app)


# ── REGISTER ──────────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    vorname  = data.get("vorname",  "").strip()
    nachname = data.get("nachname", "").strip()
    email    = data.get("email",    "").strip().lower()
    password = data.get("password", "")

    # Basic validation
    if not vorname or not nachname or not email or not password:
        return jsonify({"error": "Alle Felder sind erforderlich."}), 400

    if len(password) < 6:
        return jsonify({"error": "Passwort muss mindestens 6 Zeichen haben."}), 400

    # Check if email is already taken
    if find_user_by_email(email):
        return jsonify({"error": "Diese E-Mail-Adresse ist bereits registriert."}), 409

    # Hash the password — never save plain text
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    # Save new user to Cosmos DB
    create_user(vorname, nachname, email, hashed)

    return jsonify({"message": "Registrierung erfolgreich."}), 201


# ── LOGIN ─────────────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email    = data.get("email",    "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "E-Mail und Passwort erforderlich."}), 400

    # Find the user in Cosmos DB by email
    user = find_user_by_email(email)

    # Check if user exists AND password matches the hash
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "E-Mail oder Passwort falsch."}), 401

    # Save user info in the session (Flask sets a cookie in the browser)
    session["user_id"] = user["id"]
    session["email"]   = user["email"]
    session["vorname"] = user["vorname"]

    return jsonify({
        "message": "Anmeldung erfolgreich.",
        "user": {
            "vorname":  user["vorname"],
            "nachname": user["nachname"],
            "email":    user["email"],
        }
    }), 200


# ── LOGOUT ────────────────────────────────────────────────
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Abgemeldet."}), 200


# ── ME (check who is logged in) ───────────────────────────
@app.route("/api/me", methods=["GET"])
def me():
    if "user_id" not in session:
        return jsonify({"error": "Nicht angemeldet."}), 401

    return jsonify({
        "vorname": session.get("vorname"),
        "email":   session.get("email"),
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
