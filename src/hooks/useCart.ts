import { useState, useEffect, useCallback } from 'react';
import { CartItem, CartResponse, AddToCartRequest } from '../types/cart';
import { cartApiService } from '../services/cartApi';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerCartUpdated = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  }, []);

  const fetchCart = useCallback(async () => {
    // Only fetch cart if user is authenticated
    if (!isAuthenticated) {
      setCart(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useCart - Fetching cart...');
      const cartData = await cartApiService.getCart();
      console.log('useCart - Cart data received:', {
        hasCartData: !!cartData,
        cartItems: cartData?.CartItems,
        cartItemsLength: cartData?.CartItems?.length,
        totalItems: cartData?.TotalItems,
        totalAmount: cartData?.TotalAmount,
        fullData: cartData
      });
      setCart(cartData);
      console.log('useCart - Cart state updated');
    } catch (err: any) {
      // Silently handle 401 errors (user not authenticated)
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        setCart(null);
        setError(null);
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(errorMessage);
      console.error('useCart - Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (request: AddToCartRequest) => {
    if (!isAuthenticated) {
      throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartApiService.addToCart(request);
      setCart(updatedCart);
      triggerCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(errorMessage);
      console.error('useCart - Error adding to cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!isAuthenticated) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      setLoading(true);
      setError(null);
      await cartApiService.removeFromCart(itemId);
      // Refresh cart after removal
      await fetchCart();
      triggerCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from cart';
      setError(errorMessage);
      console.error('useCart - Error removing from cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, [fetchCart, isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      setLoading(true);
      setError(null);
      await cartApiService.clearCart();
      setCart(null);
      triggerCartUpdated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('useCart - Error clearing cart:', err);
      throw err; // Re-throw để component có thể handle
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      fetchCart();
    };
    window.addEventListener('cart-updated', handler);
    return () => {
      window.removeEventListener('cart-updated', handler);
    };
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
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
