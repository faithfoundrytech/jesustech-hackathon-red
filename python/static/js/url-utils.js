/**
 * URL Utilities
 * Helper functions for URL handling in the application
 */

/**
 * Get the base URL for API requests
 * This ensures consistent API URLs across the application
 * @returns {string} The base URL for API requests
 */
function getBaseUrl() {
  // Get the current origin (protocol + hostname + port)
  const origin = window.location.origin;
  
  // Fallback to localhost if origin is not available
  // (can happen in some test environments)
  if (!origin) {
    console.warn('Could not determine origin, using localhost');
    return 'http://localhost:8000';
  }
  
  // Check if we're running on a development server (localhost)
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    // For local development, we might be running on different ports
    const port = window.location.port || '8000';
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
  
  return origin;
}

/**
 * Parse URL parameters into an object
 * @param {string} url - URL to parse (defaults to current URL)
 * @returns {Object} An object containing URL parameters
 */
function getUrlParameters(url = window.location.href) {
  const params = {};
  const parser = document.createElement('a');
  parser.href = url;
  
  const query = parser.search.substring(1);
  const vars = query.split('&');
  
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0]) {
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
  }
  
  return params;
}

/**
 * Creates a URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Parameters to add
 * @returns {string} URL with parameters
 */
function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}
