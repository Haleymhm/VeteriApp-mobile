import { View, Text } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/lib/useZodForm';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validators';
import * as authApi from '@/api/auth';
import { getErrorMessage } from '@/lib/errors';

export function RegisterForm() {
  const {
    values,
    errors,
    generalError,
    isSubmitting,
    setValue,
    handleSubmit,
  } = useZodForm<RegisterFormValues>(registerSchema, {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  async function onSubmit(v: RegisterFormValues) {
    try {
      await authApi.register({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: v.password,
        confirmPassword: v.confirmPassword,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo crear la cuenta'));
    }
  }

  const submit = handleSubmit(onSubmit);

  return (
    <View className="w-full gap-4">
      {generalError ? (
        <View className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <Text className="text-sm text-danger">{generalError}</Text>
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <Input
          label="Nombre"
          placeholder="Juan"
          autoCapitalize="words"
          value={values.firstName ?? ''}
          onChangeText={(t) => setValue('firstName', t)}
          error={errors.firstName}
          editable={!isSubmitting}
          containerClassName="flex-1"
          required
        />
        <Input
          label="Apellido"
          placeholder="Pérez"
          autoCapitalize="words"
          value={values.lastName ?? ''}
          onChangeText={(t) => setValue('lastName', t)}
          error={errors.lastName}
          editable={!isSubmitting}
          containerClassName="flex-1"
          required
        />
      </View>
      <Input
        label="Email"
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={values.email ?? ''}
        onChangeText={(t) => setValue('email', t)}
        error={errors.email}
        editable={!isSubmitting}
        required
      />
      <Input
        label="Contraseña"
        placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        value={values.password ?? ''}
        onChangeText={(t) => setValue('password', t)}
        error={errors.password}
        editable={!isSubmitting}
        required
      />
      <Input
        label="Repetir contraseña"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        value={values.confirmPassword ?? ''}
        onChangeText={(t) => setValue('confirmPassword', t)}
        error={errors.confirmPassword}
        editable={!isSubmitting}
        required
      />
      <Button
        title="Crear cuenta"
        loading={isSubmitting}
        onPress={submit}
        fullWidth
      />
    </View>
  );
}
