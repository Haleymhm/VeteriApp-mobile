import { View, Text } from 'react-native';
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
        label="Email"
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={values.email ?? ''}
        onChangeText={(text) => setValue('email', text)}
        error={errors.email}
        editable={!isSubmitting}
      />
      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        value={values.password ?? ''}
        onChangeText={(text) => setValue('password', text)}
        error={errors.password}
        editable={!isSubmitting}
      />
      <Button
        title="Iniciar sesión"
        loading={isSubmitting}
        onPress={submit}
        fullWidth
      />
    </View>
  );
}
