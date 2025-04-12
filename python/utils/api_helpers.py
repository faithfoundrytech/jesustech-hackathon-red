import requests
import time
import logging
from typing import List, Optional, Dict, Any, Generator, Callable

logger = logging.getLogger(__name__)

def stream_openrouter_response(
    prompt: str,
    model: str, 
    api_key: str,
    base_url: str = "https://openrouter.ai/api/v1",
    timeout: int = 30
) -> Generator[str, None, None]:
    """Stream responses from OpenRouter to avoid timeouts on large responses."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://jesustech-hackathon.com",
        "X-Title": "JesusTech Hackathon"
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
        "max_tokens": 1500  # Limit token count to reduce processing time
    }
    
    try:
        response = requests.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json=data,
            stream=True,
            timeout=timeout
        )
        
        response.raise_for_status()
        
        # Process the streaming response
        content = ""
        for line in response.iter_lines():
            if line:
                line_text = line.decode('utf-8')
                # Skip the "data: " prefix and empty lines
                if line_text.startswith("data: ") and line_text != "data: [DONE]":
                    try:
                        json_str = line_text[6:]  # Remove "data: " prefix
                        chunk = json.loads(json_str)
                        if "choices" in chunk and chunk["choices"]:
                            delta = chunk["choices"][0].get("delta", {})
                            if "content" in delta:
                                content_chunk = delta["content"]
                                content += content_chunk
                                yield content_chunk
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to parse streaming response chunk: {line_text}")
        
    except Exception as e:
        logger.error(f"Error streaming from OpenRouter: {str(e)}")
        raise

def call_with_fallback_models(
    prompt: str,
    models: List[str] = [
        "google/gemini-1.5-pro-latest", 
        "anthropic/claude-3-opus:beta",
        "anthropic/claude-3-haiku:beta", 
        "gpt-4o"
    ],
    api_key: str = None,
    base_url: str = "https://openrouter.ai/api/v1"
) -> str:
    """Try multiple models in sequence if earlier ones fail."""
    last_error = None
    
    for model in models:
        try:
            logger.info(f"Trying model: {model}")
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://jesustech-hackathon.com",
                "X-Title": "JesusTech Hackathon"
            }
            
            data = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1500
            }
            
            response = requests.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=(10, 60)  # Connection timeout, read timeout
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            if "choices" in response_data and response_data["choices"]:
                return response_data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.warning(f"Failed with model {model}: {str(e)}")
            last_error = e
            continue  # Try next model
    
    # If we get here, all models failed
    raise Exception(f"All models failed. Last error: {str(last_error)}")
