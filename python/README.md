# JesusTech Hackathon Project

## Installation

1. Create a virtual environment (if not already done):
   ```
   python3 -m venv env
   ```

2. Activate the virtual environment:
   - On macOS/Linux:
     ```
     source env/bin/activate
     ```
   - On Windows:
     ```
     .\env\Scripts\activate
     ```

3. Install dependencies (note: always use python3 -m pip to ensure you're using the right pip):
   ```
   python3 -m pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python3 app.py
   ```

## Troubleshooting

### libmagic / python-magic Issues

If you encounter an error related to `libmagic` or `python-magic`:

#### On macOS:
```bash
# Install libmagic using Homebrew
brew install libmagic

# Then reinstall python-magic-bin
python3 -m pip uninstall python-magic python-magic-bin -y
python3 -m pip install python-magic-bin
```

#### On Linux:
```bash
# Install libmagic using your package manager
sudo apt-get install libmagic1    # For Debian/Ubuntu
sudo yum install file-libs        # For RHEL/CentOS

# Then reinstall python-magic
python3 -m pip uninstall python-magic -y
python3 -m pip install python-magic
```

#### On Windows:
Windows users may need to install the appropriate binaries as described in the [python-magic documentation](https://github.com/ahupp/python-magic#dependencies).

### Pydantic Errors

If you encounter Pydantic v2 compatibility errors:

1. Make sure you're using the latest Pydantic syntax:
   - Replace `orm_mode = True` with `from_attributes = True` in Config classes
   - Replace `__modify_schema__` with `__get_pydantic_json_schema__`
   - For more details, see [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/migration/)

2. You can test the database models separately with:
   ```bash
   python3 test_db.py
   ```

3. If issues persist, try downgrading Pydantic:
   ```bash
   python3 -m pip uninstall pydantic -y
   python3 -m pip install pydantic==1.10.8
   ```

### OpenSSL Warning

If you see a warning about LibreSSL vs OpenSSL, this is normally not critical and the application should still function properly.

# Sermon Game Generator API

This API transforms sermons into interactive games using AI agents. It supports various input formats including YouTube videos, PDFs, and text.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
python app.py
```

## API Endpoints

### POST /api/process-sermon

Process a sermon and generate an interactive game.

**Request Body:**
```json
{
    "content_type": "youtube",  // or "pdf" or "text"
    "content": "https://youtube.com/watch?v=...",  // URL or text content
    "custom_prompt": "Make the game focus on biblical principles"  // optional
}
```

**Response:**
```json
{
    "success": true,
    "game_plan": {
        "theme": "string",
        "main_topics": ["string"],
        "game_structure": {}
    },
    "questions": [
        {
            "question": "string",
            "correct_answer": "string",
            "question_type": "multiple_choice",
            "options": ["string"],
            "hints": ["string"],
            "learning_points": ["string"]
        }
    ]
}
```

## Features

1. **Planner Agent**: Analyzes the sermon and creates a game plan
2. **Question Writer**: Generates 8-12 questions based on the sermon content
3. **Question Designer**: Designs interactive questions with wrong answers and learning points
4. **Multi-format Support**: Handles YouTube videos, PDFs, and text input

## Error Handling

The API returns appropriate error messages with 500 status code if something goes wrong.

## Security

The API uses CORS to allow cross-origin requests. Make sure to configure CORS settings appropriately for production use.

## API Testing with Postman

This project includes a Postman collection for easy API testing.

### Setup

1. Install [Postman](https://www.postman.com/downloads/)
2. Import the collection:
   - Open Postman
   - Click "Import" button
   - Select the file: `postman_collection.json`
   - Click "Import"

### Available Tests

1. **Process Text Sermon** - Test processing a simple text sermon
2. **Process YouTube Sermon** - Test processing and transcribing a YouTube sermon
3. **Process PDF Sermon** - Test processing a PDF sermon document
4. **Get Game** - Retrieve a game by its ID

### Processing PDF Files

To test with PDF files, you'll need to convert the PDF to base64 encoding first:

```bash
# This will output a JSON request body you can use in Postman
python3 pdf_to_base64.py path/to/sermon.pdf "Custom game prompt here"
```

## Running the Frontend

The project includes a web-based frontend for easy interaction with the API.

### Option 1: Using the run_frontend.py script

```bash
python3 run_frontend.py
```

This will start the Flask server and automatically open your web browser to the frontend interface.

### Option 2: Manual access

1. Start the Flask server:
```bash
python3 app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

### Frontend Features

- Upload sermons in text, YouTube URL, or PDF format
- Add custom prompts for game generation
- Transcribe content without generating a game
- View generated game plans and questions
- Interactive display of game questions with answers and learning points

### API Documentation