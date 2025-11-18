'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: number;
  priority: number;
  actionUrl?: string;
  createdAt: string;
}

export const useSignalR = (onNotificationReceived?: (notification: NotificationData) => void) => {
  const { isAuthenticated, user } = useAuth();
  const [connectionState, setConnectionState] = useState<'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting'>('Disconnected');
  const hubConnectionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
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
      setConnectionState('Connecting');
      
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
        .configureLogging(LogLevel.Information)
        .build();

      // Handle connection events
      connection.onclose((error) => {
        console.log('SignalR connection closed', error);
        setConnectionState('Disconnected');
      });

      connection.onreconnecting((error) => {
        console.log('SignalR reconnecting', error);
        setConnectionState('Reconnecting');
      });

      connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected', connectionId);
        setConnectionState('Connected');
      });

      // Listen for notifications
      connection.on('ReceiveNotification', (notification: NotificationData) => {
        console.log('Received notification via SignalR:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      });

      // Start connection
      await connection.start();
      console.log('SignalR connected');
      setConnectionState('Connected');
      
      hubConnectionRef.current = connection;
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      setConnectionState('Disconnected');
      
      // Retry after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [isAuthenticated, user, onNotificationReceived]);

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
    }
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

  return {
    connectionState,
    isConnected: connectionState === 'Connected',
  };
};

