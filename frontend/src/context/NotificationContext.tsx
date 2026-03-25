import React, { createContext, useContext, useState } from 'react';
import { NOTIFICATIONS } from '@/lib/staticData';

interface NotificationContextType {
  unreadCount: number;
  refetchCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refetchCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount] = useState(NOTIFICATIONS.filter((n) => !n.isRead).length);

  return (
    <NotificationContext.Provider value={{ unreadCount, refetchCount: () => {} }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
