from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import pytube
import PyPDF2
import magic
import io
import tempfile
import subprocess
import openai  # Use the old-style import instead of OpenAI class
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Sermon, Game, Question
import re
import time
import logging
from utils.youtube_helpers import download_youtube_audio, validate_youtube_url

# Modify Flask app initialization to serve static files with proper permissions
app = Flask(__name__, static_url_path='', static_folder='static')

# Update CORS to be completely permissive for development
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
     supports_credentials=True)

# Load environment variables
load_dotenv()

# Database setup
engine = create_engine('sqlite:///sermon_games.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# OpenRouter configuration
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# OpenAI configuration for transcription (using old style API)
openai.api_key = OPENROUTER_API_KEY

class SermonInput(BaseModel):
    content_type: str  # 'youtube', 'pdf', 'text'
    content: str  # URL or text content
    custom_prompt: str = ""
    title: Optional[str] = None

class GamePlan(BaseModel):
    theme: str
    main_topics: List[str]
    game_structure: Dict[str, Any]

class Question(BaseModel):
    question: str
    correct_answer: str
    question_type: str  # 'multiple_choice', 'slider', 'text'
    options: List[str] = []
    hints: List[str] = []
    learning_points: List[str] = []

def call_openrouter(prompt: str, model: str = "anthropic/claude-3-opus") -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}]
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        response_data = response.json()
        
        # Log response for debugging
        app.logger.debug(f"OpenRouter API response: {response_data}")
        
        if "choices" not in response_data or not response_data["choices"] or "message" not in response_data["choices"][0]:
            raise Exception(f"Unexpected API response format: {response_data}")
            
        return response_data["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        app.logger.error(f"OpenRouter API request error: {str(e)}")
        raise Exception(f"OpenRouter API error: {str(e)}")
    except json.JSONDecodeError as e:
        app.logger.error(f"JSON parsing error: {str(e)}, Response content: {response.text}")
        raise Exception(f"Failed to parse API response: {str(e)}")
    except Exception as e:
        app.logger.error(f"Unexpected error in call_openrouter: {str(e)}")
        raise

def extract_text_from_youtube(youtube_url):
    """
    Extract audio from a YouTube video and convert it to text.
    """
    try:
        # Download audio using our helper function with built-in retries
        audio_file_path = download_youtube_audio(youtube_url)
        
        # Convert audio to text using existing code
        # ...existing code for audio conversion...
        
        return text
    except Exception as e:
        logging.error(f"YouTube processing error: {str(e)}")
        raise Exception(f"YouTube processing error: {str(e)}")

def extract_text_from_pdf(pdf_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(pdf_content)
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"PDF processing error: {str(e)}")

def validate_content_type(content_type: str) -> None:
    valid_types = ['youtube', 'pdf', 'text']
    if content_type not in valid_types:
        raise ValueError(f"Invalid content_type. Must be one of: {', '.join(valid_types)}")

# Add a global error handler to debug 500 errors
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({
        "success": False,
        "error": f"Internal server error: {str(e)}"
    }), 500

def extract_json_from_text(text: str) -> str:
    """
    Extract JSON from text that may have preamble or explanation text around it.
    """
    app.logger.debug(f"Attempting to extract JSON from: {text}")
    
    # If the response already looks like clean JSON, return it
    if text.strip().startswith('{') or text.strip().startswith('['):
        return text.strip()
    
    # Extract JSON from markdown code blocks
    if "```json" in text:
        json_content = text.split("```json")[1].split("```")[0].strip()
        return json_content
    elif "```" in text:
        json_content = text.split("```")[1].split("```")[0].strip()
        return json_content
        
    # Try to extract JSON by finding the first { or [ character
    json_start = text.find('{')
    array_start = text.find('[')
    
    # Find which comes first (if both exist)
    if json_start >= 0 and (array_start < 0 or json_start < array_start):
        # Find the corresponding closing brace
        brace_count = 1
        for i in range(json_start + 1, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                
            if brace_count == 0:
                return text[json_start:i+1]
    elif array_start >= 0:
        # Find the corresponding closing bracket
        bracket_count = 1
        for i in range(array_start + 1, len(text)):
            if text[i] == '[':
                bracket_count += 1
            elif text[i] == ']':
                bracket_count -= 1
                
            if bracket_count == 0:
                return text[array_start:i+1]
                
    # If we can't extract JSON, return the original text
    app.logger.warning("Couldn't extract JSON from text")
    return text

@app.route('/api/process-sermon', methods=['POST', 'OPTIONS'])
def process_sermon():
    # Handle OPTIONS requests separately to avoid errors
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    session = Session()
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
            
        app.logger.info(f"Processing sermon request: {data}")
        sermon_input = SermonInput(**data)
        validate_content_type(sermon_input.content_type)
        
        # Extract text based on content type
        if sermon_input.content_type == 'youtube':
            text = extract_text_from_youtube(sermon_input.content)
        elif sermon_input.content_type == 'pdf':
            text = extract_text_from_pdf(sermon_input.content.encode())
        else:
            text = sermon_input.content

        # Store sermon in database with title
        sermon = Sermon(
            title=sermon_input.title or "Untitled Sermon",  # Default title if not provided
            content_type=sermon_input.content_type,
            content=sermon_input.content,
            source_url=sermon_input.content if sermon_input.content_type == 'youtube' else None,
            custom_prompt=sermon_input.custom_prompt
        )
        session.add(sermon)
        session.commit()

        # Planner Agent
        planner_prompt = f"""
        Analyze this sermon and create a game plan:
        {text}
        
        Custom requirements: {sermon_input.custom_prompt}
        
        Create a structured plan with:
        1. Main theme
        2. Key topics
        3. Game structure (how to make it engaging)
        
        Return ONLY the JSON response with no explanatory text before or after:
        {{
            "theme": "main theme of the sermon",
            "main_topics": ["topic1", "topic2", "topic3"],
            "game_structure": {{
                "format": "game format description",
                "rules": "game rules"
            }}
        }}
        """
        
        planner_response = call_openrouter(planner_prompt)
        
        # Handle potential JSON parsing issues
        try:
            app.logger.info(f"Planner response: {planner_response}")
            # Extract JSON from the response
            json_content = extract_json_from_text(planner_response)
            app.logger.info(f"Extracted JSON: {json_content}")
            game_plan_data = json.loads(json_content)
            game_plan = GamePlan(**game_plan_data)
        except json.JSONDecodeError as e:
            app.logger.error(f"Failed to parse planner response: {str(e)}, Response: {planner_response}")
            return jsonify({
                "success": False, 
                "error": f"Failed to parse game plan: {str(e)}", 
                "raw_response": planner_response
            }), 500
        except Exception as e:
            app.logger.error(f"Error creating game plan: {str(e)}")
            return jsonify({
                "success": False, 
                "error": f"Error creating game plan: {str(e)}", 
                "raw_response": planner_response
            }), 500

        # Store game in database
        game = Game(
            sermon_id=sermon.id,
            theme=game_plan.theme,
            main_topics=game_plan.main_topics,
            game_structure=game_plan.game_structure
        )
        session.add(game)
        session.commit()

        # Question Writer Agent
        question_writer_prompt = f"""
        Based on this game plan, create 8-12 questions:
        {json.dumps(game_plan.dict())}
        
        For each question:
        1. Write the question
        2. Provide the correct answer
        3. Suggest question type
        
        Return ONLY the JSON array with no explanatory text before or after:
        [
            {{
                "question": "question text",
                "correct_answer": "correct answer text",
                "question_type": "multiple_choice"
            }},
            ...more questions...
        ]
        """
        
        question_writer_response = call_openrouter(question_writer_prompt)
        
        # Handle potential JSON parsing issues for questions
        try:
            app.logger.info(f"Question writer response: {question_writer_response}")
            json_content = extract_json_from_text(question_writer_response)
            app.logger.info(f"Extracted questions JSON: {json_content}")
            questions = json.loads(json_content)
            if not isinstance(questions, list):
                raise ValueError("Questions response is not a list")
        except json.JSONDecodeError as e:
            app.logger.error(f"Failed to parse questions: {str(e)}, Response: {question_writer_response}")
            return jsonify({
                "success": False, 
                "error": f"Failed to parse questions: {str(e)}", 
                "raw_response": question_writer_response
            }), 500
        except Exception as e:
            app.logger.error(f"Error creating questions: {str(e)}")
            return jsonify({
                "success": False, 
                "error": f"Error creating questions: {str(e)}", 
                "raw_response": question_writer_response
            }), 500

        # Question Designer Agent
        designed_questions = []
        for question_data in questions:
            designer_prompt = f"""
            Design this question for a game:
            {json.dumps(question_data)}
            
            Create:
            1. Wrong answer options
            2. Visual elements if needed
            3. Hints or learning points
            
            Return ONLY the JSON with no explanatory text before or after:
            {{
                "question": "question text",
                "correct_answer": "correct answer",
                "question_type": "multiple_choice",
                "options": ["option1", "option2", "option3", "option4"],
                "hints": ["hint1", "hint2"],
                "learning_points": ["learning point 1", "learning point 2"]
            }}
            """
            
            try:
                designed_question_response = call_openrouter(designer_prompt)
                app.logger.info(f"Question designer response: {designed_question_response}")
                
                json_content = extract_json_from_text(designed_question_response)
                app.logger.info(f"Extracted designed question JSON: {json_content}")
                question_dict = json.loads(json_content)
                
                # Store question in database
                question = Question(
                    game_id=game.id,
                    question=question_dict['question'],
                    correct_answer=question_dict['correct_answer'],
                    question_type=question_dict['question_type'],
                    options=question_dict.get('options', []),
                    hints=question_dict.get('hints', []),
                    learning_points=question_dict.get('learning_points', [])
                )
                session.add(question)
                designed_questions.append(question_dict)
            except Exception as e:
                app.logger.error(f"Error processing question: {str(e)}")
                # Continue with other questions instead of failing the entire request
                continue

        session.commit()

        return jsonify({
            "success": True,
            "game_plan": game_plan.dict(),
            "questions": designed_questions,
            "sermon_id": sermon.id,
            "game_id": game.id
        })

    except ValueError as e:
        session.rollback()
        app.logger.error(f"Validation error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        session.rollback()
        app.logger.error(f"Process sermon error: {str(e)}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    session = Session()
    try:
        game = session.query(Game).filter_by(id=game_id).first()
        if not game:
            return jsonify({"success": False, "error": "Game not found"}), 404
            
        questions = session.query(Question).filter_by(game_id=game_id).all()
        
        return jsonify({
            "success": True,
            "game": {
                "id": game.id,
                "theme": game.theme,
                "main_topics": game.main_topics,
                "game_structure": game.game_structure,
                "questions": [{
                    "id": q.id,
                    "question": q.question,
                    "correct_answer": q.correct_answer,
                    "question_type": q.question_type,
                    "options": q.options,
                    "hints": q.hints,
                    "learning_points": q.learning_points
                } for q in questions]
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

# Add a new endpoint to get all games
@app.route('/api/games', methods=['GET'])
def get_all_games():
    session = Session()
    try:
        games = session.query(Game).all()
        
        return jsonify({
            "success": True,
            "games": [{
                "id": game.id,
                "theme": game.theme,
                "main_topics": game.main_topics,
                "sermon_id": game.sermon_id,
                "created_at": game.created_at.isoformat()
            } for game in games]
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

# Add an endpoint to get sermon details
@app.route('/api/sermons/<int:sermon_id>', methods=['GET'])
def get_sermon(sermon_id):
    session = Session()
    try:
        sermon = session.query(Sermon).filter_by(id=sermon_id).first()
        if not sermon:
            return jsonify({"success": False, "error": "Sermon not found"}), 404
            
        return jsonify({
            "success": True,
            "sermon": {
                "id": sermon.id,
                "title": sermon.title,
                "content_type": sermon.content_type,
                "source_url": sermon.source_url,
                "custom_prompt": sermon.custom_prompt,
                "created_at": sermon.created_at.isoformat()
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

# Add transcription-only endpoint
@app.route('/api/transcribe', methods=['POST', 'OPTIONS'])
def transcribe_content():
    # Handle OPTIONS requests separately to avoid errors
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    try:
        data = request.json
        if not data or 'content_type' not in data or 'content' not in data:
            return jsonify({"success": False, "error": "Missing content_type or content"}), 400
            
        content_type = data['content_type']
        content = data['content']
        
        validate_content_type(content_type)
        
        # Extract text based on content type
        if content_type == 'youtube':
            text = extract_text_from_youtube(content)
        elif content_type == 'pdf':
            text = extract_text_from_pdf(content.encode())
        else:
            text = content
        
        return jsonify({
            "success": True,
            "transcription": text
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Add explicit error handlers
@app.errorhandler(403)
def forbidden(e):
    return jsonify({"success": False, "error": "Access forbidden. Check permissions and CORS configuration."}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Resource not found."}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

# Add a simple test endpoint to verify API is working with multiple methods
@app.route('/api/test', methods=['GET', 'POST', 'OPTIONS'])
def test_api():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response
    elif request.method == 'POST':
        # Handle POST request
        data = request.json or {}
        return jsonify({
            "success": True, 
            "message": "API POST test successful", 
            "received_data": data
        })
    else:
        # Default GET request
        return jsonify({"success": True, "message": "API GET test successful"})

# Add a middleware to ensure all responses have CORS headers
@app.after_request
def add_cors_headers(response):
    # Only add headers if they're not already present
    if 'Access-Control-Allow-Origin' not in response.headers:
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 
                           'Content-Type, Authorization, X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 
                           'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Add a route to serve the index.html file
@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    # Use 0.0.0.0 to bind to all interfaces, allowing both localhost and 127.0.0.1 access
    print("Starting server at http://localhost:8000")
    print("You can also access it at http://127.0.0.1:8000")
    app.run(debug=True, host='0.0.0.0', port=8000, threaded=True)