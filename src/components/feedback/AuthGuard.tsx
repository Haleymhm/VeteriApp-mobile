import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';

interface GuardProps {
  children: React.ReactNode;
  privateZone: boolean;
}

export function AuthGuard({ children, privateZone }: GuardProps) {
  const status = useAuthStore((s) => s.status);

  if (status === 'loading' || status === 'idle') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  if (privateZone && status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  if (!privateZone && status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
