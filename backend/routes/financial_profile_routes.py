from flask import Blueprint, jsonify, request, session

from database.financial_profile_service import (
    add_goal,
    add_life_event,
    get_financial_profile,
    patch_financial_profile_section,
    save_financial_profile,
    update_financial_profile_with_log,
)


financial_profile_bp = Blueprint("financial_profile", __name__)


def _current_user_id():
    return session.get("user_id")


def _require_login():
    if not _current_user_id():
        return jsonify({"error": "Nicht angemeldet."}), 401
    return None


@financial_profile_bp.route("/api/financial-profile", methods=["GET"])
def get_profile():
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    profile = get_financial_profile(_current_user_id())
    if not profile:
        return jsonify({"error": "Finanzprofil nicht gefunden."}), 404

    return jsonify(profile), 200


@financial_profile_bp.route("/api/financial-profile", methods=["PUT", "POST"])
def upsert_profile():
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    data = request.get_json(silent=True) or {}

    try:
        profile = save_financial_profile(_current_user_id(), data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(profile), 200


@financial_profile_bp.route("/api/financial-profile", methods=["PATCH"])
def update_profile_with_log():
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    data = request.get_json(silent=True) or {}

    try:
        profile = update_financial_profile_with_log(_current_user_id(), data)
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(profile), 200


@financial_profile_bp.route("/api/financial-profile/<section_name>", methods=["PATCH"])
def update_profile_section(section_name):
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "JSON-Daten erforderlich."}), 400

    try:
        profile = patch_financial_profile_section(
            _current_user_id(),
            section_name,
            data,
        )
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(profile), 200


@financial_profile_bp.route("/api/financial-profile/goals", methods=["POST"])
def create_goal():
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    try:
        goal = add_goal(_current_user_id(), request.get_json(silent=True) or {})
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(goal), 201


@financial_profile_bp.route("/api/financial-profile/life-events", methods=["POST"])
def create_life_event():
    unauthorized = _require_login()
    if unauthorized:
        return unauthorized

    try:
        event = add_life_event(_current_user_id(), request.get_json(silent=True) or {})
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(event), 201
