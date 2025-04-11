#!/usr/bin/env python3
"""
Debug script to test CORS preflight requests
"""
import requests
import sys
import json

def test_cors_preflight(url="http://localhost:8000"):
    """Test CORS preflight requests to various endpoints"""
    endpoints = [
        "/api/process-sermon",
        "/api/transcribe",
        "/api/test"
    ]
    
    print(f"Testing CORS preflight requests to {url}\n")
    
    for endpoint in endpoints:
        full_url = f"{url}{endpoint}"
        print(f"Testing OPTIONS request to {full_url}")
        
        headers = {
            "Origin": "http://127.0.0.1:8000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        
        try:
            response = requests.options(full_url, headers=headers)
            print(f"Status: {response.status_code}")
            print("Headers:")
            for key, value in response.headers.items():
                if key.lower().startswith('access-control'):
                    print(f"  {key}: {value}")
            print()
            
        except Exception as e:
            print(f"Error: {str(e)}\n")

def send_test_post(url="http://localhost:8000"):
    """Send a simple test POST to verify API functionality"""
    test_endpoint = f"{url}/api/test"
    test_data = {"test": True, "message": "This is a test POST request"}
    
    print(f"Sending test POST to {test_endpoint}")
    try:
        # Add explicit headers for testing
        headers = {
            "Content-Type": "application/json",
            "Origin": "http://127.0.0.1:8000"
        }
        
        response = requests.post(
            test_endpoint,
            headers=headers,
            json=test_data
        )
        print(f"Status: {response.status_code}")
        print("Response Headers:")
        for key, value in response.headers.items():
            if key.lower().startswith('access-control'):
                print(f"  {key}: {value}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
        
    # Also test a GET request
    print("\nSending test GET to same endpoint")
    try:
        response = requests.get(test_endpoint, headers={"Origin": "http://127.0.0.1:8000"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    url = "http://localhost:8000"
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    test_cors_preflight(url)
    print("-" * 50)
    send_test_post(url)
