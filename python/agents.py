from typing import Dict, List, Any
from openai import OpenAI
import json
import requests
import logging

class Agent:
    def __init__(self, api_key: str):
        self.api_key = api_key  # Store the API key
        self.client = OpenAI(api_key=api_key)
        self.model = "anthropic/claude-3-opus"
        self.logger = logging.getLogger(__name__)

    def call_openrouter(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            response_json = response.json()
            
            if "choices" not in response_json or not response_json["choices"] or "message" not in response_json["choices"][0]:
                raise Exception(f"Unexpected API response format: {response_json}")
                
            return response_json["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            self.logger.error(f"OpenRouter API request error: {str(e)}")
            raise Exception(f"OpenRouter API error: {str(e)}")
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON parsing error: {str(e)}, Response content: {response.text}")
            raise Exception(f"Failed to parse API response: {str(e)}")

    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """Safely parse JSON response and handle common formatting issues"""
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to fix common JSON issues
            fixed_json = response.strip()
            
            # First, check if the response has a preamble text before the JSON
            if fixed_json.startswith("Here is") or fixed_json.startswith("Here's") or "JSON" in fixed_json.split("\n")[0]:
                # Find the first occurrence of { or [
                json_start = fixed_json.find('{')
                array_start = fixed_json.find('[')
                
                # Find which comes first (if both exist)
                if json_start >= 0 and (array_start < 0 or json_start < array_start):
                    # Find the corresponding closing brace
                    brace_count = 1
                    for i in range(json_start + 1, len(fixed_json)):
                        if fixed_json[i] == '{':
                            brace_count += 1
                        elif fixed_json[i] == '}':
                            brace_count -= 1
                            
                        if brace_count == 0:
                            fixed_json = fixed_json[json_start:i+1]
                            break
                elif array_start >= 0:
                    # Find the corresponding closing bracket
                    bracket_count = 1
                    for i in range(array_start + 1, len(fixed_json)):
                        if fixed_json[i] == '[':
                            bracket_count += 1
                        elif fixed_json[i] == ']':
                            bracket_count -= 1
                            
                        if bracket_count == 0:
                            fixed_json = fixed_json[array_start:i+1]
                            break
            
            # Check if the response is wrapped in a code block
            elif fixed_json.startswith("```json"):
                fixed_json = fixed_json.split("```json")[1].split("```")[0].strip()
            elif fixed_json.startswith("```"):
                fixed_json = fixed_json.split("```")[1].split("```")[0].strip()
            
            try:
                return json.loads(fixed_json)
            except json.JSONDecodeError as e:
                self.logger.error(f"Still failed to parse JSON after fixing: {str(e)}")
                # Return the error message together with the raw response for debugging
                raise ValueError(f"Failed to parse JSON: {str(e)}. Raw response: {response}")

class ContentAnalyzer(Agent):
    def analyze_sermon(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Analyze this sermon text and extract:
        1. Main theme and message
        2. Key biblical references
        3. Target audience
        4. Emotional tone
        5. Key learning points
        
        Return ONLY the JSON with no explanatory text before or after:
        {{
            "theme": "main theme",
            "biblical_references": ["ref1", "ref2"],
            "target_audience": "description of audience",
            "emotional_tone": "description of tone",
            "key_points": ["point1", "point2", "point3"]
        }}
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class GameDesigner(Agent):
    def design_game(self, analysis: Dict[str, Any], custom_prompt: str = "") -> Dict[str, Any]:
        prompt = f"""
        Based on this sermon analysis:
        {json.dumps(analysis)}
        
        Custom requirements: {custom_prompt}
        
        Design a game that:
        1. Matches the sermon's theme and message
        2. Is appropriate for the target audience
        3. Incorporates the key learning points
        4. Uses appropriate game mechanics
        
        Return ONLY the JSON with no explanatory text before or after:
        {{
            "game_title": "title",
            "game_type": "type (quiz, adventure, etc.)",
            "target_audience": "description",
            "mechanics": ["mechanic1", "mechanic2"],
            "learning_objectives": ["objective1", "objective2"]
        }}
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class QuestionGenerator(Agent):
    def generate_questions(self, game_design: Dict[str, Any], num_questions: int = 10) -> List[Dict[str, Any]]:
        prompt = f"""
        Based on this game design:
        {json.dumps(game_design)}
        
        Generate {num_questions} questions that:
        1. Test understanding of the sermon
        2. Vary in difficulty
        3. Include different question types
        4. Have clear correct answers
        
        Return the questions as a valid, parseable JSON array with each question having exactly these fields:
        [
            {{
                "question": "question text",
                "correct_answer": "correct answer",
                "question_type": "multiple_choice/true_false/fill_in_blank",
                "difficulty": "easy/medium/hard"
            }},
            ... more questions ...
        ]
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class VisualDesigner(Agent):
    def generate_visuals(self, question: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        For this question:
        {json.dumps(question)}
        
        Design appropriate visuals that:
        1. Enhance understanding
        2. Are culturally appropriate
        3. Match the sermon's tone
        4. Are engaging for the target audience
        
        Return the visual design in JSON format.
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class DifficultyBalancer(Agent):
    def balance_difficulty(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        prompt = f"""
        For these questions:
        {json.dumps(questions)}
        
        Adjust the difficulty to create a balanced game that:
        1. Starts with easier questions
        2. Gradually increases in difficulty
        3. Has a good mix of question types
        4. Maintains engagement throughout
        
        Return the balanced questions in JSON format.
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class FeedbackAnalyzer(Agent):
    def analyze_feedback(self, game_session: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Based on this game session data:
        {json.dumps(game_session)}
        
        Analyze:
        1. Player performance
        2. Question effectiveness
        3. Areas for improvement
        4. Learning outcomes
        
        Return the analysis in JSON format.
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)

class ContentModerator(Agent):
    def moderate_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Review this content:
        {json.dumps(content)}
        
        Check for:
        1. Theological accuracy
        2. Cultural sensitivity
        3. Age-appropriateness
        4. Educational value
        
        Return the moderation results in JSON format.
        """
        response = self.call_openrouter(prompt)
        return self.parse_json_response(response)
