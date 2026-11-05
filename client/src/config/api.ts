// CivicPulse AI - Frontend API Configuration
// Centralized API client for communicating with the Express backend.

// @ts-ignore — Vite injects import.meta.env at build time
const VITE_ENV = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const API_BASE_URL = VITE_ENV.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get the full URL for an API endpoint.
 */
export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Get authorization headers for API requests.
 * Uses Firebase ID token when available, falls back to demo token.
 */
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check for Firebase token first (will be set when Firebase Auth is integrated)
  const firebaseToken = sessionStorage.getItem('civicpulse_firebase_token');
  if (firebaseToken) {
    headers['Authorization'] = `Bearer ${firebaseToken}`;
    return headers;
  }

  // Fallback: create a demo token from localStorage user data
  const storedUser = localStorage.getItem('civicpulse_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const demoToken = btoa(JSON.stringify({
        uid: user.id || 'citizen-demo',
        role: user.role || 'citizen',
        email: user.email,
        phone: user.phone,
      }));
      headers['Authorization'] = `Bearer ${demoToken}`;
    } catch {
      // Invalid stored user, skip auth header
    }
  }

  return headers;
};

/**
 * Make an authenticated GET request to the API.
 */
export const apiGet = async <T = unknown>(path: string): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Make an authenticated POST request to the API.
 */
export const apiPost = async <T = unknown>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Make an authenticated PUT request to the API.
 */
export const apiPut = async <T = unknown>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Make an authenticated PATCH request to the API.
 */
export const apiPatch = async <T = unknown>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Make an authenticated DELETE request to the API.
 */
export const apiDelete = async <T = unknown>(path: string): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Make a multipart form data POST request (for file uploads).
 */
export const apiUpload = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
  const headers: Record<string, string> = {};

  // Add auth but NOT Content-Type (browser sets it with boundary for FormData)
  const firebaseToken = sessionStorage.getItem('civicpulse_firebase_token');
  if (firebaseToken) {
    headers['Authorization'] = `Bearer ${firebaseToken}`;
  } else {
    const storedUser = localStorage.getItem('civicpulse_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const demoToken = btoa(JSON.stringify({
          uid: user.id || 'citizen-demo',
          role: user.role || 'citizen',
          email: user.email,
          phone: user.phone,
        }));
        headers['Authorization'] = `Bearer ${demoToken}`;
      } catch {
        // skip
      }
    }
  }

  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

export default {
  apiUrl,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
};
