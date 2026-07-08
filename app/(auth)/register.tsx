import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerClassName="flex-grow justify-center px-6 py-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-primary">Crear cuenta</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Regístrate para gestionar las citas y el historial de tus mascotas.
        </Text>
      </View>

      <RegisterForm />

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-gray-600">¿Ya tienes cuenta?</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-sm font-semibold text-primary">
            Inicia sesión
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
