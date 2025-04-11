import io
import base64
import logging
import magic  # python-magic library for file type detection

logger = logging.getLogger(__name__)

def detect_file_type(content):
    """
    Detect the file type from content which could be bytes, string, or base64 encoded.
    Returns a tuple of (mime_type, decoded_content)
    """
    # Handle different types of input
    if isinstance(content, str):
        # Check if it's base64 encoded
        if content.startswith("data:"):
            try:
                # Extract the declared MIME type
                declared_mime = content.split(";")[0].split(":")[1]
                # Extract the base64 content
                base64_content = content.split("base64,")[1]
                # Decode base64
                decoded_content = base64.b64decode(base64_content)
                # Double-check mime type
                detected_mime = magic.from_buffer(decoded_content, mime=True)
                
                logger.debug(f"Base64 content detected. Declared: {declared_mime}, Detected: {detected_mime}")
                return (detected_mime, decoded_content)
            except Exception as e:
                logger.error(f"Error decoding base64 content: {str(e)}")
                # Return original content if decoding fails
                return ("text/plain", content.encode('utf-8'))
        else:
            # Treat as plain text
            return ("text/plain", content.encode('utf-8'))
    elif isinstance(content, bytes):
        # Already in bytes format
        mime_type = magic.from_buffer(content, mime=True)
        return (mime_type, content)
    else:
        # Unsupported type
        return (None, None)

def is_valid_pdf(content):
    """Check if content is a valid PDF"""
    mime_type, decoded_content = detect_file_type(content)
    if mime_type == "application/pdf":
        # Additional PDF validation checks could be added here
        if decoded_content.startswith(b'%PDF-'):
            return True
    return False
