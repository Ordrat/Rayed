/**
 * API Client for making requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.rayed.app';
const API_VERSION = '1.0';

interface ApiRequestOptions extends RequestInit {
  token?: string;
  apiVersion?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes an API request with proper headers and error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, apiVersion = API_VERSION, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
    'X-Api-Version': apiVersion,
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // For text/plain or other content types, get as text
      const textData = await response.text();
      // Try to parse as JSON in case the content-type header is wrong
      try {
        data = JSON.parse(textData);
      } catch {
        // If not valid JSON, return as-is (could be a plain text success message)
        data = textData;
      }
    }

    if (!response.ok) {
      // Log detailed error information for debugging
      // console.error('API Error Details:', {
      //   url,
      //   status: response.status,
      //   statusText: response.statusText,
      //   data,
      // });

      const errorMessage = 
        data?.detail || 
        data?.title || 
        data?.message ||
        data?.error ||
        `HTTP ${response.status}: ${response.statusText}` ||
        'An error occurred';

      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}
