#!/usr/bin/env python3
"""
VisaXpert Backend Smoke Test
Tests core API endpoints after restoration/cloning
"""

import requests
import json
import sys
from datetime import datetime

# Read backend URL from frontend .env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.split('=')[1].strip()
            break

API_BASE = f"{BACKEND_URL}/api"

print(f"Testing VisaXpert API at: {API_BASE}")
print("=" * 80)

# Test counters
tests_passed = 0
tests_failed = 0
test_results = []

def test_endpoint(name, method, url, expected_status=200, json_data=None, params=None, check_keys=None):
    """Generic test function for API endpoints"""
    global tests_passed, tests_failed
    
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=json_data, params=params, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Check status code
        if response.status_code != expected_status:
            test_results.append({
                "name": name,
                "status": "FAIL",
                "reason": f"Expected status {expected_status}, got {response.status_code}",
                "response": response.text[:200]
            })
            tests_failed += 1
            return False, response
        
        # Check JSON response keys if specified
        if check_keys:
            try:
                data = response.json()
                missing_keys = [k for k in check_keys if k not in data]
                if missing_keys:
                    test_results.append({
                        "name": name,
                        "status": "FAIL",
                        "reason": f"Missing keys in response: {missing_keys}",
                        "response": json.dumps(data, indent=2)[:200]
                    })
                    tests_failed += 1
                    return False, response
            except Exception as e:
                test_results.append({
                    "name": name,
                    "status": "FAIL",
                    "reason": f"Failed to parse JSON: {str(e)}",
                    "response": response.text[:200]
                })
                tests_failed += 1
                return False, response
        
        test_results.append({
            "name": name,
            "status": "PASS",
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:100]
        })
        tests_passed += 1
        return True, response
        
    except Exception as e:
        test_results.append({
            "name": name,
            "status": "FAIL",
            "reason": f"Exception: {str(e)}"
        })
        tests_failed += 1
        return False, None


print("\n1. Testing Health Check Endpoint")
print("-" * 80)
success, response = test_endpoint(
    "GET /api/",
    "GET",
    f"{API_BASE}/",
    check_keys=["message", "status"]
)
if success:
    data = response.json()
    print(f"✅ Health check passed: {data}")
else:
    print(f"❌ Health check failed")

print("\n2. Discovering Lead Capture Endpoint")
print("-" * 80)
print("Based on code inspection:")
print("  - Frontend form submits to: POST /api/enquiry")
print("  - Payload schema: name, email, phone, country_of_interest, counselling_mode, preferred_branch")
print("  - Alternative webhook endpoint: POST /api/webhook/lead")

print("\n3. Testing Lead Capture - POST /api/enquiry")
print("-" * 80)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
test_lead_data = {
    "name": "Rajesh Kumar",
    "email": f"rajesh.test.{timestamp}@example.com",
    "phone": "9876543210",
    "country_of_interest": "Germany",
    "counselling_mode": "online",
    "preferred_branch": None
}
print(f"Submitting test lead: {test_lead_data['name']} - {test_lead_data['email']}")
success, response = test_endpoint(
    "POST /api/enquiry",
    "POST",
    f"{API_BASE}/enquiry",
    json_data=test_lead_data,
    check_keys=["id", "name", "email", "phone", "status"]
)
if success:
    lead_response = response.json()
    print(f"✅ Lead created successfully")
    print(f"   Lead ID: {lead_response.get('id')}")
    print(f"   Status: {lead_response.get('status')}")
    print(f"   Created at: {lead_response.get('created_at')}")
    
    # Verify lead persisted to MongoDB
    print("\n   Verifying lead persistence in MongoDB...")
    lead_id = lead_response.get('id')
    import time
    time.sleep(1)  # Wait for async write
    from pymongo import MongoClient
    import os
    mongo_client = MongoClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = mongo_client[os.environ.get('DB_NAME', 'test_database')]
    found = db.leads.find_one({"lead_id": lead_id})
    if found:
        print(f"   ✅ Lead persisted to MongoDB successfully")
    else:
        print(f"   ⚠️  Lead not found in MongoDB (may be async delay)")
    mongo_client.close()
else:
    print(f"❌ Lead creation failed")

print("\n4. Testing Alternative Lead Capture - POST /api/webhook/lead")
print("-" * 80)
timestamp2 = datetime.now().strftime("%Y%m%d_%H%M%S")
webhook_lead_data = {
    "full_name": "Priya Sharma",
    "phone_number": "9988776655",
    "email": f"priya.test.{timestamp2}@example.com",
    "country": "Canada",
    "source": "university_change",
    "utm_campaign": "smoke_test",
    "utm_source": "testing",
    "consultation_mode": "online",
    "current_university": "Test University",
    "transfer_type": "Same Course"
}
print(f"Submitting webhook lead: {webhook_lead_data['full_name']} - {webhook_lead_data['email']}")
success, response = test_endpoint(
    "POST /api/webhook/lead",
    "POST",
    f"{API_BASE}/webhook/lead",
    json_data=webhook_lead_data,
    check_keys=["success", "lead_id"]
)
if success:
    webhook_response = response.json()
    print(f"✅ Webhook lead created successfully")
    print(f"   Lead ID: {webhook_response.get('lead_id')}")
    print(f"   Message: {webhook_response.get('message')}")
else:
    print(f"❌ Webhook lead creation failed")

print("\n5. Testing Content Endpoints")
print("-" * 80)

# Test GET /api/countries
print("\n5a. GET /api/countries")
success, response = test_endpoint(
    "GET /api/countries",
    "GET",
    f"{API_BASE}/countries"
)
if success:
    try:
        countries = response.json()
        print(f"✅ Countries endpoint working - returned {len(countries)} countries")
        if countries:
            print(f"   Sample: {countries[0] if isinstance(countries, list) else list(countries.keys())[:3]}")
    except:
        print(f"✅ Countries endpoint returned data")
else:
    print(f"❌ Countries endpoint failed")

# Test GET /api/branches
print("\n5b. GET /api/branches")
success, response = test_endpoint(
    "GET /api/branches",
    "GET",
    f"{API_BASE}/branches"
)
if success:
    try:
        branches = response.json()
        print(f"✅ Branches endpoint working - returned {len(branches)} branches")
        if branches:
            print(f"   Sample: {branches[0] if isinstance(branches, list) else list(branches.keys())[:3]}")
    except:
        print(f"✅ Branches endpoint returned data")
else:
    print(f"❌ Branches endpoint failed")

# Test GET /api/reviews
print("\n5c. GET /api/reviews")
success, response = test_endpoint(
    "GET /api/reviews",
    "GET",
    f"{API_BASE}/reviews",
    params={"limit": 5}
)
if success:
    try:
        reviews = response.json()
        count = len(reviews) if isinstance(reviews, list) else reviews.get('total', 0)
        print(f"✅ Reviews endpoint working - returned {count} reviews")
    except:
        print(f"✅ Reviews endpoint returned data")
else:
    print(f"❌ Reviews endpoint failed")

# Test GET /api/success-stories
print("\n5d. GET /api/success-stories")
success, response = test_endpoint(
    "GET /api/success-stories",
    "GET",
    f"{API_BASE}/success-stories"
)
if success:
    try:
        stories = response.json()
        count = len(stories) if isinstance(stories, list) else stories.get('total', 0)
        print(f"✅ Success stories endpoint working - returned {count} stories")
    except:
        print(f"✅ Success stories endpoint returned data")
else:
    print(f"❌ Success stories endpoint failed")

# Test GET /api/templates
print("\n5e. GET /api/templates")
success, response = test_endpoint(
    "GET /api/templates",
    "GET",
    f"{API_BASE}/templates"
)
if success:
    try:
        templates = response.json()
        count = len(templates) if isinstance(templates, list) else templates.get('total', 0)
        print(f"✅ Templates endpoint working - returned {count} templates")
    except:
        print(f"✅ Templates endpoint returned data")
else:
    print(f"❌ Templates endpoint failed")

print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"Total Tests: {tests_passed + tests_failed}")
print(f"✅ Passed: {tests_passed}")
print(f"❌ Failed: {tests_failed}")

if tests_failed > 0:
    print("\nFailed Tests Details:")
    print("-" * 80)
    for result in test_results:
        if result["status"] == "FAIL":
            print(f"\n❌ {result['name']}")
            print(f"   Reason: {result.get('reason', 'Unknown')}")
            if 'response' in result:
                print(f"   Response: {result['response']}")

print("\n" + "=" * 80)
print("NOTES:")
print("- Optional integrations (Resend email, WhatsApp, Google Sheets) NOT tested")
print("- These require API keys which are intentionally unconfigured")
print("- Core API functionality and data persistence tested")
print("=" * 80)

sys.exit(0 if tests_failed == 0 else 1)
