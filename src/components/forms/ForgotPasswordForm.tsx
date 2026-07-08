import { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/lib/useZodForm';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validators';
import * as authApi from '@/api/auth';
import { getErrorMessage } from '@/lib/errors';

interface ForgotPasswordFormProps {
  onSent?: (email: string) => void;
}

export function ForgotPasswordForm({ onSent }: ForgotPasswordFormProps) {
  const [sent, setSent] = useState(false);
  const {
    values,
    errors,
    generalError,
    isSubmitting,
    setValue,
    handleSubmit,
  } = useZodForm<ForgotPasswordFormValues>(forgotPasswordSchema, {
    email: '',
  });

  async function onSubmit(v: ForgotPasswordFormValues) {
    try {
      await authApi.forgotPassword(v.email);
      setSent(true);
      onSent?.(v.email);
    } catch (error) {
      // Aun cuando el backend responda 200 pretendiendo éxito, podría fallar
      // la red. Manejamos el error visible.
      Alert.alert('No se pudo enviar', getErrorMessage(error, 'Reintenta más tarde'));
      throw new Error(getErrorMessage(error, 'No se pudo enviar el correo'));
    }
  }

  const submit = handleSubmit(onSubmit);

  if (sent) {
    return (
      <View className="w-full gap-3 rounded-xl bg-success/10 p-4">
        <Text className="text-base font-semibold text-success">
          Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
        </Text>
        <Text className="text-sm text-gray-700">
          Revisa tu bandeja de entrada y spam. Vuelve atrás para iniciar sesión.
        </Text>
      </View>
    );
  }

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
        onChangeText={(t) => setValue('email', t)}
        error={errors.email}
        editable={!isSubmitting}
      />
      <Button
        title="Enviar enlace de recuperación"
        loading={isSubmitting}
        onPress={submit}
        fullWidth
      />
    </View>
  );
}
