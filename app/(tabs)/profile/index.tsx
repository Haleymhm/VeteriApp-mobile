import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Loading, ErrorState } from '@/components/feedback/States';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getErrorMessage } from '@/lib/errors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Cargando...';

  const { data: profile, isLoading, error, refetch } = useProfile();

  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-12 pt-6">
      <Section title="Mi perfil">
        <Card className="items-center gap-3 py-6">
          <Avatar name={displayName} size="xl" />
          <Text className="text-xl font-bold text-gray-900">{displayName}</Text>
          {user?.email ? (
            <Text className="text-sm text-gray-500">{user.email}</Text>
          ) : null}
        </Card>
      </Section>

      <Section title="Datos personales">
        {isLoading ? (
          <Loading label="Cargando datos..." />
        ) : error ? (
          <ErrorState
            message={getErrorMessage(error)}
          />
        ) : profile ? (
          <Card className="gap-3">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Teléfono" value={profile.phone} />
            <InfoRow label="Dirección" value={profile.address} />
            <InfoRow label="RUT" value={profile.rut} />
            <InfoRow
              label="Comuna"
              value={profile.comuna?.name}
              fallback={profile.region?.name ? `${profile.region.name} · -` : '—'}
            />
            <InfoRow
              label="Región"
              value={profile.region?.name}
            />
          </Card>
        ) : null}
        {error ? (
          <Button
            title="Reintentar"
            variant="secondary"
            onPress={() => {
              void refetch();
            }}
          />
        ) : null}
      </Section>

      <Section title="Acciones">
        <View className="gap-2">
          <Link href="/(tabs)/profile/edit" asChild>
            <Button title="Editar mis datos" />
          </Link>
          <Link href="/(tabs)/profile/change-password" asChild>
            <Button title="Cambiar contraseña" variant="secondary" />
          </Link>
          <Button
            title="Cerrar sesión"
            variant="ghost"
            onPress={() => {
              void logout();
            }}
          />
        </View>
      </Section>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  fallback = '—',
}: {
  label: string;
  value?: string | null;
  fallback?: string;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <Text className="flex-1 text-right text-sm text-gray-900">
        {value?.trim() || fallback}
      </Text>
    </View>
  );
}
