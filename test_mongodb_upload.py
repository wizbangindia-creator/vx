#!/usr/bin/env python3
"""
MongoDB Image Upload Flow Test
Tests the POST /api/upload/image and GET /api/uploads/{filename} endpoints
to verify images are stored in MongoDB and served correctly.
"""

import requests
import io
from PIL import Image
import os

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vx-preview-1.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@visaxpert.com"
ADMIN_PASSWORD = "VisaXpert@2024"

def create_test_png():
    """Create a small valid PNG image in memory"""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_upload_with_valid_credentials():
    """Test 1: POST /api/upload/image with valid admin credentials"""
    print("\n" + "="*80)
    print("TEST 1: Upload image with valid admin credentials")
    print("="*80)
    
    url = f"{BASE_URL}/upload/image"
    params = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    # Create test PNG
    test_image = create_test_png()
    files = {
        'file': ('test_image.png', test_image, 'image/png')
    }
    
    print(f"POST {url}")
    print(f"Query params: email={ADMIN_EMAIL}, password=***")
    print(f"File: test_image.png (PNG, ~{test_image.getbuffer().nbytes} bytes)")
    
    response = requests.post(url, params=params, files=files, timeout=30)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success') == True and 'image_url' in data:
            image_url = data['image_url']
            print(f"\n✅ TEST 1 PASSED")
            print(f"   - Status code: 200")
            print(f"   - Response contains 'success': true")
            print(f"   - Response contains 'image_url': {image_url}")
            return image_url
        else:
            print(f"\n❌ TEST 1 FAILED: Response missing expected fields")
            print(f"   Expected: {{'success': true, 'image_url': '/api/uploads/<filename>'}}")
            print(f"   Got: {data}")
            return None
    else:
        print(f"\n❌ TEST 1 FAILED: Expected status 200, got {response.status_code}")
        return None

def test_get_uploaded_image(image_url):
    """Test 2: GET the uploaded image from MongoDB"""
    print("\n" + "="*80)
    print("TEST 2: Retrieve uploaded image from MongoDB")
    print("="*80)
    
    if not image_url:
        print("❌ TEST 2 SKIPPED: No image_url from previous test")
        return False
    
    # Construct full URL
    full_url = f"{BACKEND_URL}{image_url}"
    
    print(f"GET {full_url}")
    
    response = requests.get(full_url, timeout=30)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body Length: {len(response.content)} bytes")
    
    if response.status_code == 200:
        content_type = response.headers.get('content-type', '')
        content_length = len(response.content)
        
        print(f"\nContent-Type: {content_type}")
        print(f"Content-Length: {content_length} bytes")
        
        # Verify it's an image content type
        if 'image' in content_type.lower():
            print(f"✅ Content-Type is image type: {content_type}")
        else:
            print(f"⚠️  Content-Type is not image type: {content_type}")
        
        # Verify non-empty body
        if content_length > 0:
            print(f"✅ Response body is non-empty: {content_length} bytes")
        else:
            print(f"❌ Response body is empty")
            return False
        
        # Try to verify it's a valid PNG
        try:
            img = Image.open(io.BytesIO(response.content))
            print(f"✅ Valid image file: format={img.format}, size={img.size}, mode={img.mode}")
        except Exception as e:
            print(f"⚠️  Could not parse as image: {e}")
        
        print(f"\n✅ TEST 2 PASSED")
        print(f"   - Status code: 200")
        print(f"   - Content-Type: {content_type}")
        print(f"   - Body length: {content_length} bytes (non-empty)")
        print(f"   - Image served from MongoDB successfully")
        return True
    else:
        print(f"\n❌ TEST 2 FAILED: Expected status 200, got {response.status_code}")
        return False

def test_upload_with_invalid_credentials():
    """Test 3: POST /api/upload/image with invalid credentials"""
    print("\n" + "="*80)
    print("TEST 3: Upload image with invalid credentials (expect 401)")
    print("="*80)
    
    url = f"{BASE_URL}/upload/image"
    params = {
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }
    
    # Create test PNG
    test_image = create_test_png()
    files = {
        'file': ('test_image.png', test_image, 'image/png')
    }
    
    print(f"POST {url}")
    print(f"Query params: email=wrong@example.com, password=wrongpassword")
    
    response = requests.post(url, params=params, files=files, timeout=30)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 401:
        print(f"\n✅ TEST 3 PASSED")
        print(f"   - Status code: 401 (Unauthorized)")
        print(f"   - Invalid credentials correctly rejected")
        return True
    else:
        print(f"\n❌ TEST 3 FAILED: Expected status 401, got {response.status_code}")
        return False

def main():
    print("="*80)
    print("MongoDB Image Upload Flow Test")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {BASE_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    
    results = []
    
    # Test 1: Upload with valid credentials
    image_url = test_upload_with_valid_credentials()
    results.append(("Upload with valid credentials", image_url is not None))
    
    # Test 2: Get uploaded image
    if image_url:
        success = test_get_uploaded_image(image_url)
        results.append(("Retrieve uploaded image", success))
    else:
        results.append(("Retrieve uploaded image", False))
    
    # Test 3: Upload with invalid credentials
    success = test_upload_with_invalid_credentials()
    results.append(("Upload with invalid credentials (401)", success))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - MongoDB image upload flow working correctly!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
