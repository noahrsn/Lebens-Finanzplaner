import os
from dotenv import load_dotenv
load_dotenv()  # must run before config.py reads the environment variables

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from config import bcrypt
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(32))

# Allow the React dev server (port 5173/5174) to talk to Flask
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
])

# Tell bcrypt which app it belongs to
bcrypt.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
