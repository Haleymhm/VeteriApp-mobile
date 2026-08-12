import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/lib/useZodForm';
import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { useAuthStore } from '@/store/authStore';

export function LoginForm() {
  const login = useAuthStore((s) => s.login);
  const {
    values,
    errors,
    generalError,
    isSubmitting,
    setValue,
    handleSubmit,
  } = useZodForm<LoginFormValues>(loginSchema, { email: '', password: '' });

  async function onSubmit(v: LoginFormValues) {
    await login(v.email, v.password);
    router.replace('/(tabs)');
  }

  const submit = handleSubmit(onSubmit);

  return (
    <View className="w-full gap-4">
      {generalError ? (
        <View className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <Text className="text-sm text-danger">{generalError}</Text>
        </View>
      ) : null}
      <Input
        label="Correo Electrónico"
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={values.email ?? ''}
        onChangeText={(text) => setValue('email', text)}
        error={errors.email}
        editable={!isSubmitting}
        required
      />
      <View className="w-full gap-1">
        <Input
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          value={values.password ?? ''}
          onChangeText={(text) => setValue('password', text)}
          error={errors.password}
          editable={!isSubmitting}
          required
        />
        <View className="items-end mt-1">
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-sm font-medium text-brand-500">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <Button
        title="Iniciar Sesión"
        loading={isSubmitting}
        onPress={submit}
        fullWidth
        className="mt-2"
      />
    </View>
  );
}
