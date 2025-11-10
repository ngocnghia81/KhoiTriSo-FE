import { 
  CartItem, 
  AddToCartRequest, 
  CartResponse, 
  CartApiResponse 
} from '../types/cart';
import { 
  safeJsonParse, 
  isSuccessfulResponse, 
  extractResult, 
  extractMessage, 
  retryRequest 
} from '../utils/apiHelpers';

class CartApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('CartApi - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.warn('CartApi - No token found in localStorage');
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get user's cart
   */
  async getCart(): Promise<CartResponse> {
    console.log('CartApi - Getting cart');
    
    const response = await retryRequest(async () => {
      const res = await fetch(`${this.baseUrl}/api/cart`, {
        method: 'GET',
        headers: this.getAuthHeaders() as HeadersInit,
      });
      
      console.log(`CartApi - Response status: ${res.status}`);
      return res;
    });
    
    const result = await safeJsonParse(response);
    console.log('CartApi - Parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No cart data received');
      }
      
      console.log('CartApi - Cart data:', extracted);
      return extracted;
    } else {
      console.error('CartApi - Unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    console.log('CartApi - Adding to cart:', request);
    
    const response = await retryRequest(async () => {
      const res = await fetch(`${this.baseUrl}/api/cart`, {
        method: 'POST',
        headers: this.getAuthHeaders() as HeadersInit,
        body: JSON.stringify(request)
      });
      
      console.log(`CartApi - Add response status: ${res.status}`);
      return res;
    });
    
    const result = await safeJsonParse(response);
    console.log('CartApi - Add parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No cart data received after adding');
      }
      
      console.log('CartApi - Updated cart data:', extracted);
      return extracted;
    } else {
      console.error('CartApi - Add unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: number): Promise<boolean> {
    console.log(`CartApi - Removing item ${itemId} from cart`);
    
    const response = await retryRequest(async () => {
      const res = await fetch(`${this.baseUrl}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders() as HeadersInit,
      });
      
      console.log(`CartApi - Remove response status: ${res.status}`);
      return res;
    });
    
    const result = await safeJsonParse(response);
    console.log('CartApi - Remove parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      console.log('CartApi - Remove result:', extracted);
      return extracted === true;
    } else {
      console.error('CartApi - Remove unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<boolean> {
    console.log('CartApi - Clearing cart');
    
    const response = await retryRequest(async () => {
      const res = await fetch(`${this.baseUrl}/api/cart/clear`, {
        method: 'DELETE',
        headers: this.getAuthHeaders() as HeadersInit,
      });
      
      console.log(`CartApi - Clear response status: ${res.status}`);
      return res;
    });
    
    const result = await safeJsonParse(response);
    console.log('CartApi - Clear parsed result:', result);
    
    if (isSuccessfulResponse(result)) {
      console.log('CartApi - Cart cleared successfully');
      return true;
    } else {
      console.error('CartApi - Clear unsuccessful response:', result);
      throw new Error(extractMessage(result));
    }
  }
}

export const cartApiService = new CartApiService();
