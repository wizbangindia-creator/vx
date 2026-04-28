#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class VisaXpertAPITester:
    def __init__(self, base_url="https://vx-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                if response.content:
                    try:
                        resp_json = response.json()
                        if isinstance(resp_json, dict) and len(resp_json) <= 3:
                            print(f"   Response: {resp_json}")
                    except:
                        print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout")
            self.failed_tests.append({'name': name, 'error': 'Timeout'})
            return False, None
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'error': str(e)})
            return False, None

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH & INFO ENDPOINTS")
        print("="*50)
        
        # Test API root
        self.run_test("API Root", "GET", "", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "health", 200)
        
        # Test setup info
        self.run_test("Setup Info", "GET", "setup-info", 200)

    def test_enquiry_submission(self):
        """Test enquiry form submission"""
        print("\n" + "="*50)
        print("TESTING ENQUIRY SUBMISSION")
        print("="*50)
        
        # Valid enquiry data with 10-digit phone
        enquiry_data_10 = {
            "name": "Test Student 10",
            "email": "test10@example.com",
            "phone": "9876543210",  # 10 digits
            "city": "Delhi",
            "country_of_interest": "Canada"
        }
        
        success, response = self.run_test("Submit Enquiry with 10-digit phone", "POST", "enquiry", 200, enquiry_data_10)
        
        if success:
            try:
                resp_data = response.json()
                if 'id' in resp_data:
                    print(f"   Generated ID: {resp_data['id']}")
            except:
                pass

        # Valid enquiry data with 12-digit phone
        enquiry_data_12 = {
            "name": "Test Student 12",
            "email": "test12@example.com",
            "phone": "919876543210",  # 12 digits
            "city": "Delhi",
            "country_of_interest": "Canada"
        }
        
        success, response = self.run_test("Submit Enquiry with 12-digit phone", "POST", "enquiry", 200, enquiry_data_12)
        
        if success:
            try:
                resp_data = response.json()
                if 'id' in resp_data:
                    print(f"   Generated ID: {resp_data['id']}")
            except:
                pass

        # Test invalid phone numbers (should be rejected)
        invalid_phone_8 = {
            "name": "Test Student",
            "email": "test8@example.com",
            "phone": "98765432",  # 8 digits - should fail
            "city": "Delhi",
            "country_of_interest": "Canada"
        }
        self.run_test("Submit Enquiry with 8-digit phone (should fail)", "POST", "enquiry", 422, invalid_phone_8)

        invalid_phone_11 = {
            "name": "Test Student",
            "email": "test11@example.com",
            "phone": "98765432101",  # 11 digits - should fail
            "city": "Delhi",
            "country_of_interest": "Canada"
        }
        self.run_test("Submit Enquiry with 11-digit phone (should fail)", "POST", "enquiry", 422, invalid_phone_11)

        invalid_phone_13 = {
            "name": "Test Student",
            "email": "test13@example.com",
            "phone": "9876543210123",  # 13 digits - should fail
            "city": "Delhi",
            "country_of_interest": "Canada"
        }
        self.run_test("Submit Enquiry with 13-digit phone (should fail)", "POST", "enquiry", 422, invalid_phone_13)

        # Test invalid enquiry (missing required fields)
        invalid_data = {"name": "Test"}
        self.run_test("Submit Invalid Enquiry (missing fields)", "POST", "enquiry", 422, invalid_data)

    def test_webhook_endpoints(self):
        """Test webhook endpoints"""
        print("\n" + "="*50)
        print("TESTING WEBHOOK ENDPOINTS")
        print("="*50)
        
        # Test universal webhook
        webhook_data = {
            "name": "Webhook Test",
            "email": "webhook@test.com",
            "phone": "9876543210",
            "city": "Mumbai",
            "country": "Germany",
            "source": "test_webhook"
        }
        
        self.run_test("Universal Webhook", "POST", "webhook/lead", 200, webhook_data)
        
        # Test Facebook webhook verification (GET)
        self.run_test("Facebook Webhook Verify", "GET", 
                     "webhook/facebook?hub.mode=subscribe&hub.verify_token=visaxpert_verify_token_2024&hub.challenge=12345", 
                     200)

    def test_reviews_api(self):
        """Test reviews API"""
        print("\n" + "="*50)
        print("TESTING REVIEWS API")
        print("="*50)
        
        # Test get reviews
        self.run_test("Get Reviews", "GET", "reviews", 200)
        
        # Test get reviews for specific page
        self.run_test("Get Main Page Reviews", "GET", "reviews?page=main", 200)

    def test_dashboard_authentication(self):
        """Test dashboard authentication"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD AUTHENTICATION")
        print("="*50)
        
        # Test valid login
        login_data = {
            "email": "admin@visaxpert.com",
            "password": "VisaXpert@2024"
        }
        
        success, response = self.run_test("Dashboard Login", "POST", "dashboard/login", 200, login_data)
        
        if success:
            try:
                resp_data = response.json()
                if resp_data.get('success') and 'token' in resp_data:
                    print(f"   Login successful, token received")
                    return resp_data.get('user', {})
            except:
                pass
        
        # Test invalid login
        invalid_login = {
            "email": "wrong@email.com",
            "password": "wrongpassword"
        }
        
        self.run_test("Invalid Dashboard Login", "POST", "dashboard/login", 401, invalid_login)
        
        return None

    def test_dashboard_endpoints_with_auth(self):
        """Test dashboard endpoints that require authentication"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD ENDPOINTS (WITH AUTH)")
        print("="*50)
        
        # Use valid credentials for testing
        auth_params = "email=admin@visaxpert.com&password=VisaXpert@2024"
        
        # Test dashboard stats
        self.run_test("Dashboard Stats", "GET", f"dashboard/stats?{auth_params}", 200)
        
        # Test dashboard leads
        self.run_test("Dashboard Leads", "GET", f"dashboard/leads?{auth_params}", 200)
        
        # Test dashboard verify
        self.run_test("Dashboard Verify", "GET", f"dashboard/verify?{auth_params}", 200)
        
        # Test dashboard reviews
        self.run_test("Dashboard Reviews", "GET", f"dashboard/reviews?{auth_params}", 200)

    def test_germany_fair_submission(self):
        """Test Germany Fair registration"""
        print("\n" + "="*50)
        print("TESTING GERMANY FAIR REGISTRATION")
        print("="*50)
        
        fair_data = {
            "name": "Fair Test Student",
            "email": "fair@test.com",
            "phone": "9876543210",
            "city": "Ludhiana",
            "country": "Germany",
            "source": "germany_fair",
            "campaign": "Germany Fair 2026 - Ludhiana"
        }
        
        self.run_test("Germany Fair Registration", "POST", "webhook/lead", 200, fair_data)

    def test_university_change_submission(self):
        """Test University Change consultation"""
        print("\n" + "="*50)
        print("TESTING UNIVERSITY CHANGE CONSULTATION")
        print("="*50)
        
        uni_change_data = {
            "name": "University Change Test",
            "email": "unichange@test.com",
            "phone": "+49123456789",
            "city": "Berlin",
            "country": "Germany",
            "source": "university_change",
            "current_university": "Test University",
            "transfer_type": "private_to_public",
            "consultation_mode": "berlin_office"
        }
        
        self.run_test("University Change Consultation", "POST", "webhook/lead", 200, uni_change_data)

    def test_image_upload_endpoint(self):
        """Test image upload endpoint for reviews"""
        print("\n" + "="*50)
        print("TESTING IMAGE UPLOAD ENDPOINT")
        print("="*50)
        
        # Test image upload endpoint exists (without actual file upload)
        auth_params = "email=admin@visaxpert.com&password=VisaXpert@2024"
        
        # Test that the endpoint exists and requires authentication
        # We expect 422 because we're not sending a file, but the endpoint should exist
        try:
            url = f"{self.api_url}/upload/image?{auth_params}"
            response = requests.post(url, timeout=10)
            
            # We expect either 422 (missing file) or 400 (bad request) - both indicate endpoint exists
            if response.status_code in [400, 422]:
                print(f"✅ PASSED - Image upload endpoint exists (Status: {response.status_code})")
                self.tests_passed += 1
            else:
                print(f"❌ FAILED - Unexpected status: {response.status_code}")
                self.failed_tests.append({
                    'name': 'Image Upload Endpoint Check',
                    'expected': '400 or 422',
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
            self.tests_run += 1
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({'name': 'Image Upload Endpoint Check', 'error': str(e)})
            self.tests_run += 1

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting VisaXpert API Tests")
        print(f"Testing against: {self.base_url}")
        print("="*60)
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_enquiry_submission()
        self.test_webhook_endpoints()
        self.test_reviews_api()
        self.test_dashboard_authentication()
        self.test_dashboard_endpoints_with_auth()
        self.test_germany_fair_submission()
        self.test_university_change_submission()
        self.test_image_upload_endpoint()
        
        # Print final results
        print("\n" + "="*60)
        print("🏁 TEST RESULTS SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   • {test['name']}")
                if 'expected' in test:
                    print(f"     Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"     Error: {test['error']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
        
        return len(self.failed_tests) == 0

def main():
    tester = VisaXpertAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())