import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { registerPushToken } from '@/api/profile';
import { getSecureItem, setSecureItem, deleteSecureItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import type { InAppNotification } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DEFAULT_CHANNEL_ID = 'default';

export interface UsePushNotificationsResult {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  notifications: InAppNotification[];
  requestPermissions: () => Promise<Notifications.PermissionStatus | null>;
}

export function usePushNotifications(enabled: boolean): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    Notifications.PermissionStatus | null
  >(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const isRegistering = useRef(false);

  const registerToken = useCallback(async () => {
    if (isRegistering.current) return;
    if (Platform.OS === 'web') return;
    isRegistering.current = true;
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
          name: 'Notificaciones VeteriApp',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#465fff',
        });
      }

      const { status: currentStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = currentStatus;
      if (currentStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setPermissionStatus(finalStatus);
      if (finalStatus !== 'granted') {
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        console.warn('[push] No se encontró projectId de EAS');
        return;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenResponse.data;
      setExpoPushToken(token);
      await setSecureItem(STORAGE_KEYS.pushToken, token);

      const platform: 'expo' | 'ios' | 'android' =
        Platform.OS === 'ios' ? 'ios' : 'android';
      await registerPushToken({ token, platform });
    } catch (error) {
      console.warn('[push] Error registrando push token:', error);
    } finally {
      isRegistering.current = false;
    }
  }, []);

  // Registro inicial cuando el usuario está autenticado.
  // El patrón "registrar push token en un effect" es el oficial de Expo,
  // pero la regla `react-hooks/set-state-in-effect` lo marca. Lo desactivamos
  // aquí porque registerToken gestiona setState correctamente (async + guard).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!enabled) return;
    void registerToken();
  }, [enabled, registerToken]);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const content = notification.request.content;
        const inApp: InAppNotification = {
          id: notification.request.identifier,
          title: content.title ?? '',
          body: content.body ?? '',
          data: content.data as Record<string, unknown> | undefined,
          receivedAt: new Date().toISOString(),
        };
        setNotifications((prev) => [inApp, ...prev].slice(0, 50));
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const content = response.notification.request.content;
        const inApp: InAppNotification = {
          id: response.notification.request.identifier,
          title: content.title ?? '',
          body: content.body ?? '',
          data: content.data as Record<string, unknown> | undefined,
          receivedAt: new Date().toISOString(),
        };
        setNotifications((prev) => [inApp, ...prev].slice(0, 50));
      });

    const tokenSubscription = Notifications.addPushTokenListener((token) => {
      void (async () => {
        setExpoPushToken(token.data);
        await setSecureItem(STORAGE_KEYS.pushToken, token.data);
        const platform: 'expo' | 'ios' | 'android' =
          Platform.OS === 'ios' ? 'ios' : 'android';
        try {
          await registerPushToken({ token: token.data, platform });
        } catch (error) {
          console.warn('[push] Error re-registrando push token:', error);
        }
      })();
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      tokenSubscription.remove();
    };
  }, [enabled]);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      return null;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status === 'granted') {
      await registerToken();
    }
    return status;
  }, [registerToken]);

  return {
    expoPushToken,
    permissionStatus,
    notifications,
    requestPermissions,
  };
}

export async function clearPushTokenLocally(): Promise<void> {
  await deleteSecureItem(STORAGE_KEYS.pushToken);
}

export async function getStoredPushToken(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.pushToken);
}
