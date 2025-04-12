# Installation Guide

This guide will help you set up the JesusTech Hackathon project on your system.

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)
- Virtual environment tool (recommended)

## Installation Steps

### 1. Clone the repository

```bash
git clone https://github.com/your-username/jesustech-hackathon-red.git
cd jesustech-hackathon-red
```

### 2. Set up a virtual environment (recommended)

```bash
# Create a virtual environment
python3 -m venv env

# Activate the virtual environment
# On macOS/Linux:
source env/bin/activate
# On Windows:
# env\Scripts\activate
```

### 3. Install dependencies

```bash
# Install all required packages
python3 -m pip install -r requirements.txt
```

### 4. Create environment file

Create a `.env` file in the project root with the following content:

```
OPENROUTER_API_KEY=your-api-key-here
FLASK_ENV=development
FLASK_DEBUG=1
```

Replace `your-api-key-here` with your actual OpenRouter API key.

### 5. Run the application

```bash
cd python
python app.py
```

The server will start at http://localhost:8000

## Troubleshooting

### Issue: "No module named 'xyz'"

```bash
# Make sure your virtual environment is activated, then reinstall dependencies
python3 -m pip install -r requirements.txt
```

### Issue: "python-magic installation problems"

On macOS:
```bash
brew install libmagic
```

On Windows:
Download the appropriate DLL files from https://github.com/pidydx/libmagicwin64

### Issue: PDF processing errors

Make sure you have the right dependencies:
```bash
python3 -m pip install PyPDF2 pdfminer.six
```
