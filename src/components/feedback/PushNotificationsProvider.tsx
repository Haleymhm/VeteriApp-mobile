import { createContext, useContext, useMemo } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/store/authStore';
import type { InAppNotification } from '@/types';

interface PushNotificationsContextValue {
  expoPushToken: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined' | null;
  notifications: InAppNotification[];
  requestPermissions: () => Promise<'granted' | 'denied' | 'undetermined' | null>;
  unreadCount: number;
}

const PushNotificationsContext = createContext<PushNotificationsContextValue>({
  expoPushToken: null,
  permissionStatus: null,
  notifications: [],
  requestPermissions: async () => null,
  unreadCount: 0,
});

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useAuthStore((s) => s.status);
  const enabled = status === 'authenticated';
  const push = usePushNotifications(enabled);

  const value = useMemo<PushNotificationsContextValue>(
    () => ({
      expoPushToken: push.expoPushToken,
      permissionStatus: push.permissionStatus,
      notifications: push.notifications,
      requestPermissions: push.requestPermissions,
      unreadCount: push.notifications.length,
    }),
    [
      push.expoPushToken,
      push.permissionStatus,
      push.notifications,
      push.requestPermissions,
    ],
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export function usePushNotificationsContext(): PushNotificationsContextValue {
  return useContext(PushNotificationsContext);
}
