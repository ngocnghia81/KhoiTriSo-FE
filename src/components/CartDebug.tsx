'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function CartDebug() {
  const { isAuthenticated, user, token } = useAuth();

  const checkTokens = () => {
    const localToken = localStorage.getItem('accessToken');
    const localRefreshToken = localStorage.getItem('refreshToken');
    const localUser = localStorage.getItem('user');
    
    console.log('=== Token Debug Info ===');
    console.log('AuthContext token:', token ? 'Present' : 'Missing');
    console.log('localStorage accessToken:', localToken ? 'Present' : 'Missing');
    console.log('localStorage refreshToken:', localRefreshToken ? 'Present' : 'Missing');
    console.log('localStorage user:', localUser ? 'Present' : 'Missing');
    
    if (localToken) {
      console.log('Token preview:', localToken.substring(0, 50) + '...');
    }
    
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        console.log('User data:', userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('Cookies:', cookies);
    console.log('authToken cookie:', cookies.authToken ? 'Present' : 'Missing');
    console.log('refreshToken cookie:', cookies.refreshToken ? 'Present' : 'Missing');
  };

  const testAddToCart = async () => {
    try {
      console.log('Testing add to cart...');
      console.log('Auth status:', { isAuthenticated, user, token: token ? 'Present' : 'Missing' });
      
      const response = await fetch('http://localhost:8080/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ItemId: 1, ItemType: 1 })
      });
      
      console.log('Response status:', response.status);
      const data = await response.text();
      console.log('Response data:', data);
      
      if (response.ok) {
        toast.success('Test add to cart successful!');
      } else {
        toast.error(`Test failed: ${response.status} - ${data}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test error: ${error}`);
    }
  };

  const testGetCart = async () => {
    try {
      console.log('Testing get cart...');
      
      const response = await fetch('http://localhost:8080/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.text();
      console.log('Response data:', data);
      
      if (response.ok) {
        toast.success('Test get cart successful!');
      } else {
        toast.error(`Test failed: ${response.status} - ${data}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test error: ${error}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cart Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Authentication Status:</strong>
              <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            <div>
              <strong>User:</strong>
              <span className="ml-2">{user?.name || 'None'}</span>
            </div>
            <div>
              <strong>Role:</strong>
              <span className="ml-2">{user?.role || 'None'}</span>
            </div>
            <div>
              <strong>Token:</strong>
              <Badge variant={token ? "default" : "destructive"} className="ml-2">
                {token ? 'Present' : 'Missing'}
              </Badge>
            </div>
          </div>

          {!isAuthenticated && (
            <Alert variant="destructive">
              <AlertDescription>
                You need to be logged in to add items to cart. Please log in first.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={testGetCart} disabled={!isAuthenticated}>
              Test Get Cart
            </Button>
            <Button onClick={testAddToCart} disabled={!isAuthenticated}>
              Test Add to Cart
            </Button>
            <Button onClick={checkTokens} variant="outline">
              Check Tokens
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
