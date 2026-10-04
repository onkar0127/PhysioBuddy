import { API_BASE } from './config';

/**
 * Extracts a cookie value by name from document.cookie.
 * @param {string} name - Cookie name (e.g. 'csrftoken')
 * @returns {string} Cookie value or empty string
 */
export function getCookie(name) {
  let cookieValue = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Ensures a valid CSRF token is available.
 * 1. Checks document.cookie for an existing 'csrftoken'.
 * 2. If missing, bootstraps the token via GET /api/csrf/ and returns data.csrfToken.
 * 3. Gracefully falls back to cookie check or empty string to prevent runtime crashes.
 *
 * @returns {Promise<string>} Valid CSRF token string
 */
export async function ensureCsrfToken() {
  let csrfToken = getCookie('csrftoken');
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE}/api/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.csrfToken) {
        return data.csrfToken;
      }
    }
  } catch (err) {
    console.warn('CSRF bootstrap request warning:', err);
  }

  // Fallback to cookie check after server set-cookie header
  csrfToken = getCookie('csrftoken');
  return csrfToken || '';
}
