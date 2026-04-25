import requests
import json
import time

BASE_URL = "http://127.0.0.1:8080/api"

def test_chat():
    email = f"test_{int(time.time())}@example.com"
    reg_data = {"email": email, "password": "password123", "full_name": "Test User"}
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    token = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": "password123"}).json()["access_token"]

    print("Calling /chat-v2...")
    headers = {"Authorization": f"Bearer {token}"}
    chat_data = {
        "messages": [{"role": "user", "content": "Hello"}],
        "id": "test_thread"
    }
    
    r = requests.post(f"{BASE_URL}/chat-v2", json=chat_data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    print("Full Response Body:")
    print(repr(r.text))

if __name__ == "__main__":
    test_chat()
