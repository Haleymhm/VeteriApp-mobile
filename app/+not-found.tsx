import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { SafeAreaView } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  function goHome() {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900">404</Text>
      <Text className="mt-2 text-base text-gray-600">
        Pantalla no encontrada.
      </Text>
      <View className="mt-6 w-full max-w-xs">
        <Button title="Volver al inicio" onPress={goHome} />
      </View>
    </SafeAreaView>
  );
}
