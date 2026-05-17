import os
import uuid
from flask_bcrypt import Bcrypt
from azure.cosmos import CosmosClient, PartitionKey

# bcrypt is used to hash passwords — we create it here so app.py can import it
bcrypt = Bcrypt()

# Read Cosmos DB credentials from the .env file
COSMOS_ENDPOINT   = os.environ.get("COSMOS_ENDPOINT")
COSMOS_KEY        = os.environ.get("COSMOS_KEY")
DATABASE_NAME     = os.environ.get("COSMOS_DATABASE", "Lebens-Finanzplaner")
CONTAINER_NAME    = os.environ.get("COSMOS_CONTAINER_NAME", "users")

# Connect to Cosmos DB
client    = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database  = client.create_database_if_not_exists(id=DATABASE_NAME)
container = database.create_container_if_not_exists(
    id=CONTAINER_NAME,
    partition_key=PartitionKey(path="/id")
)


def find_user_by_email(email):
    """Search the users container for a document where email matches."""
    results = list(container.query_items(
        query="SELECT * FROM c WHERE c.email = @email",
        parameters=[{"name": "@email", "value": email}],
        enable_cross_partition_query=True
    ))
    # returns the user dict if found, or None if not found
    return results[0] if results else None


def create_user(vorname, nachname, email, hashed_password):
    """Save a new user document to Cosmos DB."""
    container.upsert_item({
        "id":       str(uuid.uuid4()),  # random unique ID for each user
        "vorname":  vorname,
        "nachname": nachname,
        "email":    email,
        "password": hashed_password     # already hashed, never plain text
    })
