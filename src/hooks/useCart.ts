import { useState, useEffect, useCallback } from 'react';
import { CartItem, CartResponse, AddToCartRequest } from '../types/cart';
import { cartApiService } from '../services/cartApi';

export interface UseCartReturn {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  addToCart: (request: AddToCartRequest) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartApiService.getCart();
      setCart(cartData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(errorMessage);
      console.error('useCart - Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (request: AddToCartRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartApiService.addToCart(request);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(errorMessage);
      console.error('useCart - Error adding to cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      await cartApiService.removeFromCart(itemId);
      // Refresh cart after removal
      await fetchCart();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from cart';
      setError(errorMessage);
      console.error('useCart - Error removing from cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await cartApiService.clearCart();
      setCart(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('useCart - Error clearing cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
  };
}

// Hook để add to cart từ book list
export function useAddToCart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback(async (request: AddToCartRequest) => {
    try {
      setLoading(true);
      setError(null);
      await cartApiService.addToCart(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(errorMessage);
      console.error('useAddToCart - Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addToCart,
    loading,
    error,
  };
}
