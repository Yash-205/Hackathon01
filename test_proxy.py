import requests
import json
import time

# Point to the NEXT.JS PROXY, not the FastAPI backend
BASE_URL = "http://localhost:3000/api"

def test_full_flow():
    # 1. Register a fresh test user
    email = f"test_{int(time.time())}@example.com"
    reg_data = {"email": email, "password": "password123", "full_name": "Test User"}
    print(f"Registering {email} via Proxy...")
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if r.status_code != 200:
        print("Registration failed:", r.text)
        return

    # 2. Login
    print("Logging in...")
    login_data = {"username": email, "password": "password123"}
    r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
    token = r.json()["access_token"]

    # 3. Call Chat via Proxy
    # This will test my new "Compatibility Layer" in the proxy
    print("Calling /chat via Proxy...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    chat_data = {
        "messages": [{"role": "user", "content": "Explain Quantum Physics briefly"}],
        "id": "test_thread_" + str(int(time.time()))
    }
    
    r = requests.post(f"{BASE_URL}/chat", json=chat_data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    print("Proxy Response Body (Should be clean JSON):")
    try:
        data = r.json()
        print(json.dumps(data, indent=2))
    except:
        print("Raw text (parsing failed):", r.text)

if __name__ == "__main__":
    test_full_flow()
