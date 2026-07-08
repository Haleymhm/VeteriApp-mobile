import { Text, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useZodForm } from '@/lib/useZodForm';
import { editProfileSchema, type EditProfileFormValues } from '@/lib/editProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScrollView } from 'react-native';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Loading, ErrorState } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  const { values, errors, generalError, isSubmitting, setValue, handleSubmit } =
    useZodForm<EditProfileFormValues>(editProfileSchema, initial(profile));

  if (isLoading) {
    return <Loading label="Cargando perfil..." />;
  }
  if (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  async function onSubmit(v: EditProfileFormValues) {
    await updateProfile.mutateAsync({
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone || undefined,
      address: v.address || undefined,
    });
    setSuccess(true);
    setTimeout(() => router.back(), 300);
  }

  const submit = handleSubmit(onSubmit);

  return (
    <ScrollView contentContainerClassName="gap-4 px-6 pb-12 pt-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-gray-900">Editar perfil</Text>
        <Text className="text-sm text-gray-500">
          Actualiza tu información personal.
        </Text>
      </View>

      {success ? (
        <View className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
          <Text className="text-sm text-success">Perfil actualizado.</Text>
        </View>
      ) : null}

      {generalError ? (
        <View className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <Text className="text-sm text-danger">{generalError}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Input
          label="Nombre"
          value={values.firstName ?? ''}
          onChangeText={(t) => setValue('firstName', t)}
          error={errors.firstName}
          editable={!isSubmitting}
          containerClassName="flex-1"
        />
        <Input
          label="Apellido"
          value={values.lastName ?? ''}
          onChangeText={(t) => setValue('lastName', t)}
          error={errors.lastName}
          editable={!isSubmitting}
          containerClassName="flex-1"
        />
      </View>
      <Input
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={values.email ?? ''}
        onChangeText={(t) => setValue('email', t)}
        error={errors.email}
        editable={!isSubmitting}
      />
      <Input
        label="Teléfono"
        keyboardType="phone-pad"
        value={values.phone ?? ''}
        onChangeText={(t) => setValue('phone', t)}
        error={errors.phone}
        editable={!isSubmitting}
      />
      <Input
        label="Dirección"
        value={values.address ?? ''}
        onChangeText={(t) => setValue('address', t)}
        error={errors.address}
        editable={!isSubmitting}
      />
      <Input
        label="RUT"
        value={values.rut ?? ''}
        onChangeText={(t) => setValue('rut', t)}
        error={errors.rut}
        editable={!isSubmitting}
        hint="Solo visible en tu perfil."
      />
      <Button
        title="Guardar cambios"
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

function initial(profile?: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  rut?: string | null;
} | null): Partial<EditProfileFormValues> {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    rut: profile?.rut ?? '',
  };
}
