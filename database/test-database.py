import time
from cosmos_service import setup_cosmos, write_item, read_item

def run_test():
    print("Starte Cosmos DB Test...")

    # 1. Setup durchführen (stellt sicher, dass DB und Container existieren)
    try:
        setup_cosmos()
        print("Cosmos DB Setup (Datenbank & Container) erfolgreich geprüft/erstellt.")
    except Exception as e:
        print(f"Fehler beim Setup der Cosmos DB: {e}")
        print("Bitte überprüfe, ob COSMOS_ENDPOINT und COSMOS_KEY in der .env-Datei gesetzt sind.")
        return

    # 2. Test-Daten vorbereiten
    test_id = f"test-item-{int(time.time())}"
    item_to_write = {
        "id": test_id,
        "name": "Test Benutzer",
        "description": "Dies ist ein Test-Eintrag in der Cosmos DB",
        "status": "Aktiv"
    }

    # 3. Daten schreiben
    print(f"\nSchreibe Item mit ID '{test_id}' in die Datenbank...")
    try:
        write_item(item_to_write)
        print("Erfolgreich geschrieben!")
    except Exception as e:
        print(f"Fehler beim Schreiben: {e}")
        return

    # 4. Daten lesen
    print(f"\nLese Item mit ID '{test_id}' aus der Datenbank...")
    try:
        # In cosmos_service.py wurde /id als Partition-Key gesetzt.
        # Daher ist der Partition-Key der Wert des id-Feldes.
        read_result = read_item(item_id=test_id, partition_key=test_id)
        print("Erfolgreich gelesen. Inhalt des Items:")
        print(read_result)
    except Exception as e:
        print(f"Fehler beim Lesen: {e}")

if __name__ == "__main__":
    run_test()
