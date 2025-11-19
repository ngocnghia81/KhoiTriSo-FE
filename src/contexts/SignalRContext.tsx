'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: number;
  priority: number;
  actionUrl?: string;
  createdAt: string;
}

interface SignalRContextType {
  connectionState: 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';
  isConnected: boolean;
  subscribe: (callback: (notification: NotificationData) => void) => () => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [connectionState, setConnectionState] = useState<'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting'>('Disconnected');
  const hubConnectionRef = useRef<any>(null);
  const subscribersRef = useRef<Set<(notification: NotificationData) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isHandlerRegisteredRef = useRef(false);

  const notifySubscribers = useCallback((notification: NotificationData) => {
    subscribersRef.current.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }, []);

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || hubConnectionRef.current?.state === 'Connected') {
      return;
    }

    // Dynamic import để tránh lỗi SSR
    const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found for SignalR connection');
      return;
    }

    try {
      isConnectingRef.current = true;
      setConnectionState('Connecting');
      
      // Close existing connection if any
      if (hubConnectionRef.current) {
        try {
          await hubConnectionRef.current.stop();
          isHandlerRegisteredRef.current = false;
        } catch (e) {
          console.warn('Error stopping existing connection:', e);
        }
      }
      
      const connection = new HubConnectionBuilder()
        .withUrl(`${API_URL}/notificationHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: 1, // WebSockets only
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) {
              return 1000; // 1 second
            } else if (retryContext.previousRetryCount < 10) {
              return 5000; // 5 seconds
            } else {
              return 30000; // 30 seconds
            }
          },
        })
        .configureLogging(LogLevel.Warning) // Reduce logging
        .build();

      // Handle connection events
      connection.onclose((error) => {
        console.log('SignalR connection closed', error);
        setConnectionState('Disconnected');
        isConnectingRef.current = false;
        isHandlerRegisteredRef.current = false;
      });

      connection.onreconnecting((error) => {
        console.log('SignalR reconnecting', error);
        setConnectionState('Reconnecting');
      });

      connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected', connectionId);
        setConnectionState('Connected');
        isConnectingRef.current = false;
      });

      // Listen for notifications - only register once per connection
      if (!isHandlerRegisteredRef.current) {
        connection.on('ReceiveNotification', (notification: NotificationData) => {
          console.log('Received notification via SignalR:', notification);
          notifySubscribers(notification);
        });
        isHandlerRegisteredRef.current = true;
      }

      // Start connection
      await connection.start();
      console.log('SignalR connected');
      setConnectionState('Connected');
      isConnectingRef.current = false;
      
      hubConnectionRef.current = connection;
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      setConnectionState('Disconnected');
      isConnectingRef.current = false;
      
      // Retry after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [isAuthenticated, user, notifySubscribers]);

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (hubConnectionRef.current) {
      try {
        await hubConnectionRef.current.stop();
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      hubConnectionRef.current = null;
      setConnectionState('Disconnected');
      isConnectingRef.current = false;
      isHandlerRegisteredRef.current = false;
    }
  }, []);

  // Subscribe function - returns unsubscribe function
  const subscribe = useCallback((callback: (notification: NotificationData) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return (
    <SignalRContext.Provider
      value={{
        connectionState,
        isConnected: connectionState === 'Connected',
        subscribe,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = (onNotificationReceived?: (notification: NotificationData) => void) => {
  const context = useContext(SignalRContext);
  
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }

  useEffect(() => {
    if (!onNotificationReceived) return;
    
    const unsubscribe = context.subscribe(onNotificationReceived);
    return unsubscribe;
  }, [context, onNotificationReceived]);

  return {
    connectionState: context.connectionState,
    isConnected: context.isConnected,
  };
};

