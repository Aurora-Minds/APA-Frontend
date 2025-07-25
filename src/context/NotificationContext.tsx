import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'task_due' | 'task_completed' | 'level_up';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  taskId?: string;
  level?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearUserNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Clear notifications when user changes (login/logout)
  useEffect(() => {
    if (user) {
      // Load user-specific notifications from localStorage
      const userNotificationsKey = `notifications_${user._id}`;
      const savedNotifications = localStorage.getItem(userNotificationsKey);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          // Convert timestamp strings back to Date objects
          const notificationsWithDates = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(notificationsWithDates);
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
    }
  }, [user?._id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user) {
      const userNotificationsKey = `notifications_${user._id}`;
      localStorage.setItem(userNotificationsKey, JSON.stringify(notifications));
    }
  }, [notifications, user?._id]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('Adding notification:', notification);
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notifications after 10 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 10000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const clearUserNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearUserNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 