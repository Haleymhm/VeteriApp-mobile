import { ScrollView, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="flex-grow justify-between px-6 py-10"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center">
        <View className="mb-8 items-center">
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 140, height: 140 }}
            contentFit="contain"
          />
        </View>

        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-gray-900 text-center">Iniciar Sesión</Text>
          <Text className="mt-2 text-base text-gray-500 text-center">
            Ingresa tus credenciales para acceder al sistema
          </Text>
        </View>

        <LoginForm />

        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-gray-600">¿No tienes cuenta?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-sm font-semibold text-brand-500">
                Regístrate
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View className="mt-8 items-center gap-1 py-4">
        <Text className="text-xs text-gray-400 font-medium">v1.0.0</Text>
        <Text className="text-xs text-gray-400">coprigth HidalgoWeb</Text>
      </View>
    </ScrollView>
  );
}
