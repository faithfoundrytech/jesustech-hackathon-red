#!/usr/bin/env python3
"""
Test script for YouTube video extraction
"""
import sys
import pytube
import tempfile
import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use OpenRouter API key for OpenAI
openai.api_key = os.getenv("OPENROUTER_API_KEY", "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")

def test_youtube_extraction(url, verbose=True):
    """
    Test YouTube extraction functionality
    
    Args:
        url: YouTube URL to test
        verbose: Whether to print detailed information
    
    Returns:
        dict: Result with success status and either transcription or error
    """
    try:
        if verbose:
            print(f"Testing YouTube URL: {url}")
        
        # Validate URL
        if not url or not isinstance(url, str):
            return {"success": False, "error": "URL must be a non-empty string"}
            
        if not ('youtube.com' in url or 'youtu.be' in url):
            return {"success": False, "error": f"Not a valid YouTube URL: {url}"}
        
        # Try to extract video info
        try:
            if verbose:
                print("Creating YouTube object...")
            yt = pytube.YouTube(url)
            
            if verbose:
                print(f"Video title: {yt.title}")
                print(f"Channel: {yt.author}")
                print(f"Length: {yt.length} seconds")
                print(f"Views: {yt.views}")
            
            # Get available streams
            if verbose:
                print("Available streams:")
                for stream in yt.streams:
                    print(f"  {stream}")
            
            # Get audio stream
            audio_stream = yt.streams.filter(only_audio=True).first()
            if not audio_stream:
                return {"success": False, "error": "No audio stream found"}
                
            if verbose:
                print(f"Selected audio stream: {audio_stream}")
            
            # Download audio
            if verbose:
                print("Downloading audio...")
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
                audio_path = temp_file.name
                audio_stream.download(filename=audio_path)
                
                if verbose:
                    print(f"Audio saved to: {audio_path}")
                    print(f"File size: {os.path.getsize(audio_path)} bytes")
                
                # Transcribe using OpenAI Whisper
                if verbose:
                    print("Transcribing with Whisper...")
                with open(audio_path, "rb") as audio_file:
                    transcription = openai.Audio.transcribe(
                        "whisper-1", 
                        audio_file
                    )
                
            # Clean up temp file
            os.unlink(audio_path)
            
            if verbose:
                print("Transcription successful!")
                print(f"Transcription excerpt: {transcription.text[:200]}...")
                
            return {
                "success": True,
                "transcription": transcription.text,
                "video_info": {
                    "title": yt.title,
                    "author": yt.author,
                    "length_seconds": yt.length,
                    "views": yt.views
                }
            }
            
        except pytube.exceptions.RegexMatchError as e:
            return {"success": False, "error": f"Invalid YouTube URL format: {str(e)}"}
        except pytube.exceptions.VideoUnavailable as e:
            return {"success": False, "error": f"Video unavailable: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Error during extraction: {str(e)}"}
            
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python youtube_test.py <youtube_url>")
        sys.exit(1)
        
    url = sys.argv[1]
    result = test_youtube_extraction(url)
    
    if result["success"]:
        print("\nSuccess! Transcription:")
        print("-" * 50)
        print(result["transcription"])
    else:
        print("\nError:", result["error"])
        sys.exit(1)
