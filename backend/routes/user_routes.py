from flask import Blueprint, jsonify, session
from database.user_service import get_all_users

user_bp = Blueprint('user', __name__)

@user_bp.route("/api/users", methods=["GET"])
def all_users():
    users = get_all_users()
    return jsonify(users), 200

@user_bp.route("/api/me", methods=["GET"])
def me():
    if "user_id" not in session:
        return jsonify({"error": "Nicht angemeldet."}), 401

    return jsonify({
        "vorname": session.get("vorname"),
        "email":   session.get("email"),
    }), 200

