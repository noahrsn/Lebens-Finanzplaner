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
        raise ValueError("Bitte COSMOS_ENDPOINT und COSMOS_KEY in den Umgebungsvariablen setzen.")
    return CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)

def get_database(client):
    try:
        return client.create_database_if_not_exists(id=DATABASE_NAME)
    except Exception as e:
        print(f"Fehler beim Erstellen/Abrufen der Datenbank: {e}")
        raise

def get_container(database):
    try:
        return database.create_container_if_not_exists(
            id=CONTAINER_NAME,
            partition_key=PartitionKey(path="/id"),
            offer_throughput=400
        )
    except Exception as e:
        print(f"Fehler beim Erstellen/Abrufen des Containers: {e}")
        raise

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
    try:
        client = get_cosmos_client()
        db = client.get_database_client(DATABASE_NAME)
        container = db.get_container_client(container_name)

        # upsert_item fügt das Item ein oder aktualisiert es, wenn es bereits existiert
        response = container.upsert_item(item)
        return response
    except Exception as e:
        print(f"Fehler beim Schreiben des Items: {e}")
        raise

def read_item(item_id: str, partition_key: str, container_name: str = CONTAINER_NAME):
    """
    Liest ein einzelnes Dokument anhand der ID und dem Partition Key (hier z.B. die ID).
    """
    try:
        client = get_cosmos_client()
        db = client.get_database_client(DATABASE_NAME)
        container = db.get_container_client(container_name)

        response = container.read_item(item=item_id, partition_key=partition_key)
        return response
    except Exception as e:
        print(f"Fehler beim Lesen des Items: {e}")
        raise

def query_items(query: str, parameters: list = None, container_name: str = CONTAINER_NAME):
    """
    Führt ein Query über die Daten aus, z.B. "SELECT * FROM c WHERE c.userId = @userId"
    """
    try:
        client = get_cosmos_client()
        db = client.get_database_client(DATABASE_NAME)
        container = db.get_container_client(container_name)

        items = list(container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        return items
    except Exception as e:
        print(f"Fehler beim Ausführen der Abfrage: {e}")
        raise

