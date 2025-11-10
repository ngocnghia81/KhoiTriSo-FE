/**
 * Safely parse JSON response with proper error handling
 * Clones response to avoid "body stream already read" errors
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T> {
  // Try to clone response to avoid "body stream already read" errors
  // If cloning fails (response already read), we'll use the original response
  let responseToRead: Response;
  try {
    responseToRead = response.clone();
  } catch (error) {
    // If clone fails, response body has already been read
    // This shouldn't happen in normal flow, but we'll handle it gracefully
    console.warn('Response body already read, attempting to use original response:', error);
    responseToRead = response;
  }
  
  // Check if response is ok
  if (!response.ok) {
    // Read error message from response before throwing
    try {
      const errorText = await responseToRead.text();
      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || errorData.Message || errorData.error || errorData.Error || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        } catch {
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }
    } catch (readError: any) {
      // If we can't read error (e.g., body already read), just throw status error
      if (readError.message && readError.message.includes('already read')) {
        throw new Error(`HTTP error! status: ${response.status} (Response body was already consumed)`);
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Check if response has content-type JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON');
  }
  
  // Check if response has content
  let text: string;
  try {
    text = await responseToRead.text();
  } catch (readError: any) {
    if (readError.message && readError.message.includes('already read')) {
      throw new Error('Response body was already consumed. Make sure response is only read once.');
    }
    throw readError;
  }
  
  if (!text.trim()) {
    throw new Error('Empty response');
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhanced fetch with better error handling
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Log response details for debugging
    console.log('SafeFetch Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });
    
    return response;
  } catch (error) {
    console.error('SafeFetch Error:', error);
    throw error;
  }
}

/**
 * Check if response is successful and contains expected data
 */
export function isSuccessfulResponse(response: any): boolean {
  if (!response) return false;
  
  // Check for success indicators
  const isSuccess = response.success === true || 
                   response.Success === true || 
                   response.Message === "Thành công" ||
                   response.MessageCode === "SUCCESS" ||
                   response.MessageCode === "ITEM_ALREADY_IN_CART" || // Special case for cart
                   (response.MessageCode && response.MessageCode.includes("SUCCESS")); // Any MessageCode containing SUCCESS
  
  // For cart operations, these are considered successful even with null Result
  if (response.MessageCode === "ITEM_ALREADY_IN_CART" || 
      (response.MessageCode && response.MessageCode.includes("SUCCESS"))) {
    return true;
  }
  
  // For other operations, require result data
  return isSuccess && (response.result || response.Result);
}

/**
 * Extract result from API response (handles both camelCase and PascalCase)
 */
export function extractResult<T = any>(response: any): T | null {
  if (!response) return null;
  
  return response.result || response.Result || null;
}

/**
 * Debug API response with detailed logging
 */
export function debugApiResponse(response: any, context: string = 'API Response') {
  console.group(`🔍 ${context}`);
  console.log('Raw Response:', response);
  console.log('Response Type:', typeof response);
  console.log('Has Success Field:', 'success' in response);
  console.log('Has Success (Pascal):', 'Success' in response);
  console.log('Has Message Field:', 'Message' in response);
  console.log('Has MessageCode Field:', 'MessageCode' in response);
  console.log('Has Result Field:', 'Result' in response);
  console.log('Has result Field:', 'result' in response);
  console.log('Is Successful:', isSuccessfulResponse(response));
  console.log('Extracted Result:', extractResult(response));
  console.groupEnd();
}

/**
 * Build URL with query parameters safely
 */
export function buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, value.toString());
    }
  });
  
  const queryString = urlParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Request throttling cache
const requestCache = new Map<string, { timestamp: number; promise: Promise<any> }>();
const THROTTLE_DELAY = 1000; // 1 second throttle

/**
 * Throttle requests to prevent spam
 */
export function throttleRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(key);
  
  if (cached && (now - cached.timestamp) < THROTTLE_DELAY) {
    return cached.promise;
  }
  
  const promise = requestFn();
  requestCache.set(key, { timestamp: now, promise });
  
  // Clean up old entries
  setTimeout(() => {
    requestCache.delete(key);
  }, THROTTLE_DELAY * 2);
  
  return promise;
}

/**
 * Clear request cache
 */
export function clearRequestCache(): void {
  requestCache.clear();
}

/**
 * Retry failed requests with exponential backoff and automatic token refresh
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 1, // Giảm từ 3 xuống 1
  baseDelay: number = 2000 // Tăng từ 1000ms lên 2000ms
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Không retry cho 429 Too Many Requests
      if (error instanceof Error && error.message.includes('429')) {
        throw lastError;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}

/**
 * Fetch with automatic token refresh on 401
 * This wraps fetch() to automatically refresh token when receiving 401
 */
export async function fetchWithAutoRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Import token refresh utility
  const { fetchWithTokenRefresh } = await import('./tokenRefresh');
  
  // Use token refresh wrapper
  return fetchWithTokenRefresh(url, options);
}

/**
 * Extract message from API response (handles both camelCase and PascalCase)
 */
export function extractMessage(response: any): string {
  if (!response) return 'Unknown error';
  
  // Special handling for cart operations
  if (response.MessageCode === "ITEM_ALREADY_IN_CART") {
    return "Sản phẩm đã có trong giỏ hàng";
  }
  
  // Handle any MessageCode containing SUCCESS
  if (response.MessageCode && response.MessageCode.includes("SUCCESS")) {
    // Use the Message field if available, otherwise provide a generic success message
    return response.Message || "Thao tác thành công";
  }
  
  return response.message || response.Message || 'Unknown error';
}
