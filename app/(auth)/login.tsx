import { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginScreen() {
  const [showBanner] = useState(false);

  return (
    <ScrollView
      contentContainerClassName="flex-grow justify-center px-6 py-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-primary">VeteriApp</Text>
        <Text className="mt-2 text-base text-gray-600">
          Portal del Cliente
        </Text>
      </View>

      <Text className="mb-6 text-center text-2xl font-bold text-gray-900">
        Iniciar sesión
      </Text>

      <LoginForm />

      <View className="mt-8 items-center gap-3">
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable>
            <Text className="text-sm font-medium text-primary">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </Link>
        <View className="flex-row gap-1">
          <Text className="text-sm text-gray-600">¿No tienes cuenta?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-sm font-semibold text-primary">
                Regístrate
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
      {showBanner ? null : null}
    </ScrollView>
  );
}
