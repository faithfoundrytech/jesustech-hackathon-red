/**
 * Sermon Game Generator API Client
 * Use this file in your frontend to interact with the API
 */

class SermonGameAPI {
  constructor(baseUrl = null) {
    // Use the provided baseUrl or default to the current domain's base URL
    this.baseUrl = baseUrl || (window.location.origin || 'http://localhost:5000');
  }
  
  /**
   * Process a sermon and generate a game
   * @param {string} contentType - 'youtube', 'pdf', or 'text'
   * @param {string} content - The URL or text content
   * @param {string} customPrompt - Optional custom instructions
   * @param {string} title - Optional sermon title
   * @returns {Promise} API response
   */
  async processSermon(contentType, content, customPrompt = '', title = '') {
    const response = await fetch(`${this.baseUrl}/api/process-sermon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add mode and credentials to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
      body: JSON.stringify({
        content_type: contentType,
        content: content,
        custom_prompt: customPrompt,
        title: title
      }),
    });
    
    return response.json();
  }
  
  /**
   * Just transcribe content without generating a game
   * @param {string} contentType - 'youtube', 'pdf', or 'text'
   * @param {string} content - The URL or text content
   * @returns {Promise} API response with transcription
   */
  async transcribeContent(contentType, content) {
    const response = await fetch(`${this.baseUrl}/api/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add mode and credentials to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
      body: JSON.stringify({
        content_type: contentType,
        content: content,
      }),
    });
    
    return response.json();
  }
  
  /**
   * Get details of a specific game
   * @param {number} gameId - ID of the game to retrieve
   * @returns {Promise} API response with game details
   */
  async getGame(gameId) {
    const response = await fetch(`${this.baseUrl}/api/games/${gameId}`, {
      // Add mode and credentials to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
    });
    return response.json();
  }
  
  /**
   * Get all available games
   * @returns {Promise} API response with all games
   */
  async getAllGames() {
    const response = await fetch(`${this.baseUrl}/api/games`, {
      // Add mode and credentials to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
    });
    return response.json();
  }
  
  /**
   * Get details of a specific sermon
   * @param {number} sermonId - ID of the sermon to retrieve
   * @returns {Promise} API response with sermon details
   */
  async getSermon(sermonId) {
    const response = await fetch(`${this.baseUrl}/api/sermons/${sermonId}`, {
      // Add mode and credentials to help with CORS
      mode: 'cors',
      credentials: 'same-origin',
    });
    return response.json();
  }
  
  /**
   * Utility method to encode PDF file as base64
   * @param {File} file - PDF file object from file input
   * @returns {Promise<string>} Base64 encoded PDF content
   */
  async encodePDFAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Example usage:
/*
const api = new SermonGameAPI();

// Process a text sermon
api.processSermon('text', 'This is a sample sermon...', 'Make it fun for kids', 'Sunday Sermon')
  .then(response => {
    console.log(response);
    const gameId = response.game_id;
    
    // Get the generated game
    return api.getGame(gameId);
  })
  .then(gameResponse => {
    console.log(gameResponse);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  
// Process a YouTube sermon
api.processSermon('youtube', 'https://www.youtube.com/watch?v=example', 'For young adults')
  .then(response => console.log(response))
  .catch(error => console.error('Error:', error));

// Process a PDF sermon (after getting base64 content)
document.getElementById('pdfInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  try {
    const base64Content = await api.encodePDFAsBase64(file);
    const response = await api.processSermon('pdf', base64Content, 'Focus on biblical principles');
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
});
*/
