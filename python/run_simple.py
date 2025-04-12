#!/usr/bin/env python3
"""
A simple script to run the Flask application with CORS properly configured
"""
import os
import sys

def main():
    """Run the Flask app with proper CORS settings"""
    # Configure Flask environment
    os.environ['FLASK_APP'] = 'app.py'
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    # Updated port to 8000 to match app.py
    try:
        from app import app
        print("Starting the Sermon Game Generator...")
        print("Access the application at: http://localhost:8000 or http://127.0.0.1:8000")
        app.run(host='0.0.0.0', port=8000, debug=True, threaded=True)
        return 0
    except Exception as e:
        print(f"Error running application: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
