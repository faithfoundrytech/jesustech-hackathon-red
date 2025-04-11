#!/usr/bin/env python3
"""
Minimal Flask server to verify connectivity
"""
from flask import Flask, jsonify
from flask_cors import CORS
import socket
import os

def check_port_available(port, host='127.0.0.1'):
    """Check if the port is available for use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return True
        except OSError:
            return False

def find_available_port(start_port=8000, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        if check_port_available(port):
            return port
    return None

def run_minimal_server():
    """Run a minimal Flask server to test CORS and connectivity"""
    # Create a minimal Flask app
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    @app.route('/')
    def home():
        return jsonify({"status": "ok", "message": "Minimal server is running"})
        
    @app.route('/api/test', methods=['GET', 'POST', 'OPTIONS'])
    def test():
        return jsonify({"status": "ok", "message": "API test endpoint is working"})
        
    # Find an available port
    port = find_available_port(8000)
    if not port:
        print("Could not find an available port. Please close some applications and try again.")
        return 1
        
    # Run the app
    print(f"Starting minimal server on port {port}")
    print(f"Test the server by visiting: http://localhost:{port}/api/test")
    app.run(host='0.0.0.0', port=port, debug=True)
    return 0

if __name__ == "__main__":
    run_minimal_server()
