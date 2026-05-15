from flask import Flask
from flask_login import UserMixin, LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_bcrypt import Bcrypt
from azure.cosmos import CosmosClient, exceptions
import os

app = Flask(__name__,  template_folder='../templates')

app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", os.urandom(32))

csrf = CSRFProtect(app)
csrf.init_app(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# Azure Cosmos DB config
COSMOS_ENDPOINT = os.environ["COSMOS_ENDPOINT"]
COSMOS_KEY = os.environ["COSMOS_KEY"]
DATABASE_NAME = "your_database"
CONTAINER_NAME = "users"

# Initialize Cosmos DB
client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)

class User(UserMixin):
    def __init__(self, id, username, email, password):
        self.id = id
        self.username = username
        self.email = email
        self.password = password

    @staticmethod
    def get(user_id):
        try:
            user_data = container.read_item(
                item=str(user_id),
                partition_key=str(user_id)
            )

            return User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password"]
            )

        except exceptions.CosmosResourceNotFoundError:
            return None

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)