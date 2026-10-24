import io
import sys
import os
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_complete_flow():
    print("--- 1. Testing Health Check ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health check OK:", res.json())

    print("\n--- 2. Testing Public Rates ---")
    res = client.get("/api/orders/current-rates")
    assert res.status_code == 200
    rates = res.json()
    print("Current rates:", rates)
    assert "rate_bw" in rates
    assert "rate_color" in rates

    print("\n--- 3. Testing Customer Order Submission ---")
    # Create a small dummy PDF or text-like PDF
    dummy_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    
    files = {
        "file": ("notes_assignment.pdf", dummy_pdf, "application/pdf")
    }
    data = {
        "customer_name": "Ramesh Kumar",
        "customer_phone": "9876543210",
        "print_type": "bw",
        "paper_size": "A4",
        "copies": 2,
        "page_count": 5,
        "notes": "Please staple on top left"
    }
    
    res = client.post("/api/orders", data=data, files=files)
    assert res.status_code == 201, f"Order submission failed: {res.text}"
    order = res.json()
    print("Order created successfully:", order)
    order_id = order["order_id"]
    expected_price = 5 * 2 * rates["rate_bw"] # 5 pages * 2 copies * ₹2 = ₹20.0
    assert order["total_price"] == expected_price, f"Price mismatch: {order['total_price']} vs {expected_price}"

    print("\n--- 4. Testing Customer Order Status Lookup ---")
    res = client.get(f"/api/orders/{order_id}/status")
    assert res.status_code == 200
    status_data = res.json()
    print("Status tracking result:", status_data)
    assert status_data["status"] == "new"

    print("\n--- 5. Testing Owner Login ---")
    login_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    print("Owner logged in successfully. Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 6. Testing Owner Orders Queue ---")
    res = client.get("/api/owner/orders", headers=headers)
    assert res.status_code == 200
    orders_list = res.json()
    print(f"Owner retrieved {len(orders_list)} orders.")
    found_order = next((o for o in orders_list if o["order_id"] == order_id), None)
    assert found_order is not None, "Order not found in owner queue"

    print("\n--- 7. Testing Secure Owner File Download ---")
    # Unauthenticated download must be rejected
    unauth_res = client.get(f"/api/owner/orders/{order_id}/download")
    assert unauth_res.status_code in [401, 403], f"Unauthenticated download should be blocked: {unauth_res.status_code}"
    print("Unauthenticated file download correctly blocked!")

    # Authenticated download
    download_res = client.get(f"/api/owner/orders/{order_id}/download", headers=headers)
    assert download_res.status_code == 200, f"Authenticated download failed: {download_res.status_code}"
    assert len(download_res.content) == len(dummy_pdf)
    print(f"Authenticated download succeeded: {len(download_res.content)} bytes received.")

    print("\n--- 8. Testing Order Status Update (Ready -> Printed) ---")
    res = client.patch(f"/api/owner/orders/{order_id}/status", json={"status": "ready"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "ready"

    res = client.patch(f"/api/owner/orders/{order_id}/status", json={"status": "printed"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "printed"
    print("Order transitioned to 'printed' successfully.")

    print("\n--- 9. Testing Owner Stats ---")
    res = client.get("/api/owner/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    print("Dashboard stats:", stats)
    assert stats["today_orders_count"] >= 1
    assert stats["today_cash_sales"] >= expected_price

    print("\n--- 10. Testing QR Code Generation ---")
    res = client.get("/api/owner/settings/qr-code?url=https://smartxerox.shop", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/png"
    assert len(res.content) > 1000
    print(f"QR code generated successfully: {len(res.content)} bytes PNG image.")

    print("\n==========================================")
    print("ALL 10 INTEGRATION TESTS PASSED PERFECTLY!")
    print("==========================================")

if __name__ == "__main__":
    test_complete_flow()
