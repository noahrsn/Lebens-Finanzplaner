import time
from cosmos_service import setup_cosmos, write_item, read_item

def run_test():
    setup_cosmos()

    test_id = f"test-item-{int(time.time())}"
    item_to_write = {
        "id": test_id,
        "name": "Test Benutzer",
        "description": "Test 2",
        "status": "Aktiv"
    }

    write_item(item_to_write)
    read_result = read_item(item_id=test_id, partition_key=test_id)
    print(read_result)

if __name__ == "__main__":
    run_test()
