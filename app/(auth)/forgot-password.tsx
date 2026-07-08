import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerClassName="flex-grow justify-center px-6 py-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-primary">
          Recuperar contraseña
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          Te enviaremos un enlace a tu correo para que puedas restablecerla.
          Puede tardar unos minutos.
        </Text>
      </View>

      <ForgotPasswordForm />

      <View className="mt-8 items-center">
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-sm font-semibold text-primary">
            Volver a iniciar sesión
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
