import os
from azure.cosmos import CosmosClient, PartitionKey
from dotenv import load_dotenv

load_dotenv()

# Setup Cosmos DB credentials
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = os.getenv("COSMOS_DB_NAME", "Lebens-Finanzplaner")
CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME", "Items")

def get_cosmos_client():
    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        raise ValueError("Variabeln in der .env nicht gesetzt!")
    return CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)

def get_database(client):
    return client.create_database_if_not_exists(id=DATABASE_NAME)

def get_container(database):
    return database.create_container_if_not_exists(
        id=CONTAINER_NAME,
        partition_key=PartitionKey(path="/id")
    )

def setup_cosmos():
    """Richtet Datenbank und Container ein bzw. gibt den Container zurück."""
    client = get_cosmos_client()
    db = get_database(client)
    container = get_container(db)
    return container

def write_item(item: dict, container_name: str = CONTAINER_NAME):
    """
    Schreibt ein Item (Dokument) in den Container.
    Das Item sollte ein Dictionary sein und einen Schlüssel "id" enthalten (String).
    """
    client = get_cosmos_client()
    db = client.get_database_client(DATABASE_NAME)
    container = db.get_container_client(container_name)
    return container.upsert_item(item)

def read_item(item_id: str, partition_key: str, container_name: str = CONTAINER_NAME):
    """
    Liest ein einzelnes Dokument anhand der ID und dem Partition Key (hier z.B. die ID).
    """
    client = get_cosmos_client()
    db = client.get_database_client(DATABASE_NAME)
    container = db.get_container_client(container_name)
    return container.read_item(item=item_id, partition_key=partition_key)

def query_items(query: str, parameters: list = None, container_name: str = CONTAINER_NAME):
    """
    Führt ein Query über die Daten aus, z.B. "SELECT * FROM c WHERE c.userId = @userId"
    """
    client = get_cosmos_client()
    db = client.get_database_client(DATABASE_NAME)
    container = db.get_container_client(container_name)

    return list(container.query_items(
        query=query,
        parameters=parameters,
        enable_cross_partition_query=True
    ))
