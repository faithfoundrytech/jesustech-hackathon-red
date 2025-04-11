#!/usr/bin/env python3
import sys
import platform
import subprocess
import importlib.util
import os

def check_dependency(module_name):
    """Check if a Python module is installed."""
    return importlib.util.find_spec(module_name) is not None

def check_openai_compatibility():
    """Check if OpenAI client is compatible with our usage."""
    try:
        import openai
        openai_version = getattr(openai, "__version__", "unknown")
        print(f"OpenAI version: {openai_version}")
        
        # Check if using v0.x or v1.x
        if hasattr(openai, "OpenAI"):
            print("Using OpenAI v1.x API style")
            return "v1"
        else:
            print("Using OpenAI v0.x API style")
            return "v0"
    except ImportError:
        print("Error: OpenAI package not found.")
        return None
    except Exception as e:
        print(f"Error with OpenAI package: {e}")
        return None

def main():
    """Run the application with proper error handling."""
    print("Checking dependencies...")
    
    # Check for critical dependencies
    missing_deps = []
    for module in ['flask', 'openai', 'requests']:
        if not check_dependency(module):
            missing_deps.append(module)
    
    if missing_deps:
        print(f"Error: Missing required dependencies: {', '.join(missing_deps)}")
        print("Please run: python3 -m pip install -r requirements.txt")
        return 1
    
    # Fix OpenAI environment
    openrouter_key = "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"
    os.environ["OPENAI_API_KEY"] = openrouter_key
    
    # Special handling for magic module on macOS
    try:
        import magic
    except ImportError as e:
        if "failed to find libmagic" in str(e) and platform.system() == "Darwin":
            print("Error: libmagic not found. This is required for file type detection.")
            print("\nTo fix on macOS:")
            print("1. Install libmagic: brew install libmagic")
            print("2. Reinstall python-magic-bin: python3 -m pip install python-magic-bin")
            return 1
        else:
            print(f"Error importing magic module: {e}")
            return 1
    
    # Check if app.py exists and modify it if needed
    openai_api_style = check_openai_compatibility()
    
    try:
        with open("app.py", "r") as f:
            content = f.read()
        
        need_to_update = False
        
        # Check if we need to update from OpenAI v1 style to v0 style
        if openai_api_style == "v0" and "from openai import OpenAI" in content:
            print("Detected v1 style OpenAI imports but you have v0.x installed.")
            print("Updating app.py to use v0.x style OpenAI API...")
            
            updated_content = content.replace(
                "from openai import OpenAI", 
                "import openai  # Use the old-style import instead of OpenAI class"
            )
            
            # Replace client initialization
            if "client = OpenAI(" in updated_content:
                updated_content = updated_content.replace(
                    "client = OpenAI(api_key=OPENROUTER_API_KEY)",
                    "openai.api_key = OPENROUTER_API_KEY"
                )
                updated_content = updated_content.replace(
                    "client = OpenAI()",
                    "openai.api_key = OPENROUTER_API_KEY"
                )
            
            # Replace transcription API call
            if "client.audio.transcriptions.create" in updated_content:
                updated_content = updated_content.replace(
                    "transcription = client.audio.transcriptions.create(",
                    "transcription = openai.Audio.transcribe(\"whisper-1\", "
                )
                updated_content = updated_content.replace(
                    "model=\"whisper-1\",\n                    file=audio_file",
                    "audio_file"
                )
            
            with open("app.py.bak", "w") as f:
                f.write(content)
            
            with open("app.py", "w") as f:
                f.write(updated_content)
                
            print("✅ Updated app.py to use OpenAI v0.x API (backup at app.py.bak)")
            need_to_update = True
        
        # Check if we need to update from OpenAI v0 style to v1 style
        elif openai_api_style == "v1" and "import openai" in content and "from openai import OpenAI" not in content:
            print("Detected v0 style OpenAI imports but you have v1.x installed.")
            print("Consider running python3 check_compatibility.py to fix this.")
        
        if need_to_update:
            print("Reloading application with updated code...")
    
    except Exception as e:
        print(f"Warning: Unable to check or fix app.py: {e}")
    
    try:
        from app import app
        app.run(debug=True)
        return 0
    except Exception as e:
        print(f"Error running application: {e}")
        print("\nFor detailed diagnostics, run: python3 check_compatibility.py")
        return 1

if __name__ == "__main__":
    sys.exit(main())
