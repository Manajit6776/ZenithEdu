import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'tracking' | 'delay' | 'arrival' | 'maintenance' | 'refresh' | 'update' | 'add';
  title?: string;
  message: string;
  time: string;
  read: boolean;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
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

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications

    // Send browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        icon: '/bus-icon.png',
        badge: '/bus-badge.png',
        tag: `notification-${notification.type}`,
        requireInteraction: notification.type === 'error' || notification.type === 'warning',
        silent: notification.type === 'success',
      };

      const browserNotification = new Notification(
        notification.title || `ZenithEdu: ${notification.message}`,
        notificationOptions
      );

      // Auto-close browser notification after 5 seconds for non-persistent ones
      if (!notification.persistent) {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Request notification permission on app load
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
};
