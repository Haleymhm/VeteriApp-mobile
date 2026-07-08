import { Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/lib/useZodForm';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/changePassword';
import { useChangePassword } from '@/hooks/useProfile';
import { useState } from 'react';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const { values, errors, generalError, isSubmitting, setValue, handleSubmit } =
    useZodForm<ChangePasswordFormValues>(changePasswordSchema, {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });

  async function onSubmit(v: ChangePasswordFormValues) {
    await changePassword.mutateAsync({
      currentPassword: v.currentPassword,
      newPassword: v.newPassword,
    });
    setSuccess(true);
    setTimeout(() => router.back(), 500);
  }

  const submit = handleSubmit(onSubmit);

  return (
    <ScrollView contentContainerClassName="gap-4 px-6 pb-12 pt-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-gray-900">
          Cambiar contraseña
        </Text>
        <Text className="text-sm text-gray-500">
          Usa una contraseña segura con al menos 8 caracteres, una mayúscula y
          un número.
        </Text>
      </View>

      {success ? (
        <View className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
          <Text className="text-sm text-success">Contraseña actualizada.</Text>
        </View>
      ) : null}

      {generalError ? (
        <View className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <Text className="text-sm text-danger">{generalError}</Text>
        </View>
      ) : null}

      <Input
        label="Contraseña actual"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        value={values.currentPassword ?? ''}
        onChangeText={(t) => setValue('currentPassword', t)}
        error={errors.currentPassword}
        editable={!isSubmitting}
      />
      <Input
        label="Nueva contraseña"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        value={values.newPassword ?? ''}
        onChangeText={(t) => setValue('newPassword', t)}
        error={errors.newPassword}
        editable={!isSubmitting}
      />
      <Input
        label="Repetir nueva contraseña"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        value={values.confirmNewPassword ?? ''}
        onChangeText={(t) => setValue('confirmNewPassword', t)}
        error={errors.confirmNewPassword}
        editable={!isSubmitting}
      />
      <Button
        title="Actualizar contraseña"
        loading={isSubmitting}
        onPress={submit}
      />
      <Button
        title="Cancelar"
        variant="ghost"
        onPress={() => router.back()}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
}
