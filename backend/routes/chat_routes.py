from flask import Blueprint, request, jsonify, session
from ai.gemini_service import chat, format_profile_as_context
from database.financial_profile_service import get_financial_profile

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def post_chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []

    if not message:
        return jsonify({"error": "Nachricht darf nicht leer sein."}), 400

    financial_context = None
    user_id = session.get("user_id")
    if user_id:
        try:
            profile = get_financial_profile(user_id)
            if profile:
                financial_context = format_profile_as_context(profile)
        except Exception as e:
            print(f"[chat] Finanzdaten konnten nicht geladen werden: {e}")

    try:
        result = chat(message=message, history=history, financial_context=financial_context)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
