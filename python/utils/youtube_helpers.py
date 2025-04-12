import os
import re
import tempfile
import logging
import time
from urllib.parse import urlparse, parse_qs
import pytube
import requests

# Setup logging
logger = logging.getLogger(__name__)

def validate_youtube_url(url):
    """
    Validate if a URL is a valid YouTube URL.
    
    Args:
        url (str): URL to validate
        
    Returns:
        bool: True if valid YouTube URL, False otherwise
    """
    # Basic check for URL format
    if not url or not isinstance(url, str):
        return False
    
    # Check for common YouTube URL patterns
    youtube_patterns = [
        r'^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'^https?://(?:www\.)?youtube\.com/v/[\w-]+',
        r'^https?://youtu\.be/[\w-]+',
        r'^https?://(?:www\.)?youtube\.com/embed/[\w-]+'
    ]
    
    for pattern in youtube_patterns:
        if re.match(pattern, url):
            # Try to extract video ID as final validation
            try:
                get_youtube_video_id(url)
                return True
            except Exception:
                pass
    
    return False

def get_youtube_video_id(url):
    """
    Extract the video ID from a YouTube URL.
    
    Args:
        url (str): YouTube URL
        
    Returns:
        str: YouTube video ID
        
    Raises:
        ValueError: If video ID cannot be extracted
    """
    # Handle youtu.be format
    if 'youtu.be' in url:
        path = urlparse(url).path
        video_id = path.strip('/')
        
        # Handle URLs with parameters after the ID
        if '?' in video_id:
            video_id = video_id.split('?')[0]
        
        return video_id
    
    # Handle youtube.com format
    if 'youtube.com' in url:
        query = urlparse(url).query
        params = parse_qs(query)
        if 'v' in params:
            return params['v'][0]
        
        # Handle /embed/ or /v/ formats
        path = urlparse(url).path
        if '/embed/' in path or '/v/' in path:
            video_id = path.split('/')[-1]
            return video_id
    
    raise ValueError(f"Could not extract video ID from URL: {url}")

def get_youtube_metadata(video_id):
    """
    Get metadata about a YouTube video without downloading it
    
    Args:
        video_id (str): YouTube video ID
        
    Returns:
        dict: Video metadata including title, description, etc.
    """
    try:
        # Construct YouTube URL from ID
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Get metadata using pytube without downloading
        yt = pytube.YouTube(url)
        
        return {
            "title": yt.title,
            "description": yt.description or "",
            "author": yt.author or "",
            "length_seconds": yt.length,
            "publish_date": str(yt.publish_date) if yt.publish_date else "",
            "views": yt.views,
            "video_id": video_id
        }
    except Exception as e:
        logger.error(f"Failed to get YouTube metadata for {video_id}: {str(e)}")
        return {
            "video_id": video_id,
            "title": "Unknown video",
            "description": "Could not retrieve video description"
        }

# Keep this function for backward compatibility but make it optional
def download_youtube_audio(youtube_url, max_retries=3, retry_delay=2, skip_download=True):
    """
    Download audio from a YouTube video or just return the video ID if skip_download is True.
    
    Args:
        youtube_url (str): YouTube URL
        max_retries (int): Maximum number of retry attempts
        retry_delay (int): Delay between retries in seconds
        skip_download (bool): If True, just return the video ID without downloading
        
    Returns:
        str: Path to the downloaded audio file or video ID if skip_download is True
        
    Raises:
        Exception: If download fails after all retries
    """
    try:
        # Extract video ID
        video_id = get_youtube_video_id(youtube_url)
        
        if skip_download:
            # Return video ID instead of downloading
            logger.info(f"Skipping download and returning YouTube video ID: {video_id}")
            return video_id
            
        # Original download logic goes here for backward compatibility
        retry_count = 0
        last_exception = None
        
        while retry_count < max_retries:
            try:
                # Extract video ID for naming the temp file
                video_id = get_youtube_video_id(youtube_url)
                
                # Create temp file with video ID in the name for better tracking
                temp_file = tempfile.NamedTemporaryFile(
                    suffix=f"_{video_id}.mp3", 
                    delete=False
                ).name
                
                # Create YouTube object and get audio stream
                yt = pytube.YouTube(youtube_url)
                
                # Get title for logging
                logger.info(f"Downloading audio from: '{yt.title}' (ID: {video_id})")
                
                # Get audio stream - try multiple options
                audio_stream = None
                
                # First try audio-only streams
                audio_streams = yt.streams.filter(only_audio=True)
                
                if audio_streams:
                    # Prefer mp4 format with highest quality for compatibility
                    audio_stream = audio_streams.filter(subtype='mp4').order_by('abr').last()
                
                if not audio_stream:
                    # Fallback to any audio stream
                    audio_stream = audio_streams.first()
                    
                if not audio_stream:
                    # Last resort: use a video stream and extract audio
                    audio_stream = yt.streams.filter(progressive=True).first()
                
                if not audio_stream:
                    raise Exception("No suitable audio stream found")
                    
                # Download the stream
                logger.info(f"Downloading {audio_stream.mime_type} stream, size: {audio_stream.filesize_mb:.2f}MB")
                audio_file = audio_stream.download(output_path=os.path.dirname(temp_file), 
                                                  filename=os.path.basename(temp_file))
                
                # Verify the download
                if not os.path.exists(audio_file) or os.path.getsize(audio_file) < 1000:
                    raise Exception(f"Downloaded file is too small ({os.path.getsize(audio_file)} bytes)")
                    
                logger.info(f"Successfully downloaded audio to {audio_file}")
                return audio_file
                
            except Exception as e:
                last_exception = e
                retry_count += 1
                logger.warning(f"Download attempt {retry_count} failed: {str(e)}")
                
                # Wait before retrying
                if retry_count < max_retries:
                    logger.info(f"Waiting {retry_delay} seconds before retry...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
        
        # All retries failed
        error_msg = f"Failed to download YouTube audio after {max_retries} attempts"
        if last_exception:
            error_msg += f": {str(last_exception)}"
        
        raise Exception(error_msg)
    
    except Exception as e:
        logger.error(f"YouTube processing error: {str(e)}")
        raise Exception("Invalid YouTube URL or video unavailable. Please check the URL and try again.")
