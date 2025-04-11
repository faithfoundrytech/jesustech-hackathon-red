import re
import time
import logging
from pytube import YouTube

def extract_video_id(youtube_url):
    """
    Extract the video ID from various YouTube URL formats.
    """
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&.*)?',
        r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)(?:\?.*)?',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)(?:\?.*)?',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)(?:\?.*)?'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    
    return None

def validate_youtube_url(url):
    """
    Validate a YouTube URL and return a clean version.
    """
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL format. Could not extract video ID.")
    
    return f"https://www.youtube.com/watch?v={video_id}"

def download_youtube_audio(youtube_url, max_retries=3, retry_delay=2):
    """
    Download audio from a YouTube video with retry logic.
    Returns the path to the downloaded audio file.
    """
    retry_count = 0
    last_error = None
    
    while retry_count < max_retries:
        try:
            # Clean URL
            clean_url = validate_youtube_url(youtube_url)
            
            # Create YouTube object
            yt = YouTube(clean_url)
            
            # Get audio stream
            audio_stream = yt.streams.filter(only_audio=True).first()
            
            if not audio_stream:
                raise ValueError("No suitable audio stream found for the video")
            
            # Download audio to temp file
            temp_dir = "/tmp"  # Or use tempfile.gettempdir()
            output_path = audio_stream.download(output_path=temp_dir)
            
            return output_path
            
        except Exception as e:
            logging.warning(f"YouTube download attempt {retry_count+1} failed: {str(e)}")
            last_error = e
            retry_count += 1
            
            if retry_count < max_retries:
                time.sleep(retry_delay)
            
    # If all retries failed
    error_msg = str(last_error) if last_error else "Unknown error"
    if "HTTP Error 429" in error_msg:
        raise Exception("YouTube rate limit exceeded. Please try again later.")
    elif "HTTP Error 400" in error_msg:
        raise Exception("Invalid YouTube URL or video unavailable. Please check the URL and try again.")
    elif "RegexMatchError" in error_msg or "Invalid YouTube URL" in error_msg:
        raise Exception("Invalid YouTube URL format. Please provide a valid YouTube URL.")
    else:
        raise Exception(f"Failed to process YouTube video after {max_retries} attempts: {error_msg}")
