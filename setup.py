#!/usr/bin/env python3
"""
Setup script to initialize the project, install dependencies,
and configure the environment.
"""
import subprocess
import os
import sys
import platform

def check_python_version():
    """Check if Python version is 3.7+"""
    if sys.version_info < (3, 7):
        print("Error: This project requires Python 3.7 or higher")
        sys.exit(1)
    print(f"Using Python {sys.version}")

def install_requirements():
    """Install dependencies from requirements.txt"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def setup_environment():
    """Check and create necessary environment files"""
    # Check if .env file exists, create if not
    if not os.path.exists('.env'):
        print("Creating .env file with default values...")
        with open('.env', 'w') as f:
            f.write("""# OpenRouter API Key
OPENROUTER_API_KEY=your-api-key-here

# Flask configuration
FLASK_ENV=development
FLASK_DEBUG=1
""")
        print("✅ Created .env file (please edit with your actual API keys)")
    else:
        print("✅ .env file already exists")

def main():
    """Main setup function"""
    print("\n=== JesusTech Hackathon Project Setup ===\n")
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_requirements()
    
    # Setup environment files
    setup_environment()
    
    print("\n✅ Setup complete!\n")
    print("To run the server, execute:")
    print("  cd python")
    print("  python app.py")

if __name__ == "__main__":
    main()
