import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { usePets } from '@/hooks/usePets';
import { usePushNotificationsContext } from '@/components/feedback/PushNotificationsProvider';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { AppointmentCard } from '@/components/lists/AppointmentCard';
import { Empty, ErrorState, Loading } from '@/components/feedback/States';
import { isFuture } from '@/lib/formatDate';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/formatDate';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    permissionStatus,
    requestPermissions,
  } = usePushNotificationsContext();

  const {
    data: appointments,
    isLoading: apptsLoading,
    error: apptsError,
    refetch: refetchAppts,
    isRefetching: apptsRefetching,
  } = useAppointments();

  const {
    data: pets,
    isLoading: petsLoading,
    refetch: refetchPets,
    isRefetching: petsRefetching,
  } = usePets();

  useFocusEffect(
    useCallback(() => {
      void refetchAppts();
      void refetchPets();
      return () => undefined;
    }, [refetchAppts, refetchPets]),
  );

  const upcoming = (appointments ?? [])
    .filter((a) => isFuture(a.date) && a.status !== 'CANCELLED')
    .slice(0, 3);

  const isLoading = apptsLoading || petsLoading;
  const isRefreshing = apptsRefetching || petsRefetching;
  const firstName = user?.firstName ?? '';
  const petCount = pets?.total ?? pets?.data.length ?? 0;

  function handleRefresh() {
    void refetchAppts();
    void refetchPets();
  }

  const permissionDenied = permissionStatus === 'denied';

  return (
    <ScrollView
      contentContainerClassName="gap-6 px-6 pb-12 pt-6"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="gap-1">
        <Text className="text-sm text-gray-500">Hola,</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {firstName || 'bienvenido'}
        </Text>
      </View>

      <Card className="gap-2 bg-brand-50 border-brand-100">
        <Text className="text-sm font-medium text-gray-700">Agenda rápido</Text>
        <Text className="text-xs text-gray-500">
          {petCount > 0
            ? `Tienes ${petCount} mascota${petCount === 1 ? '' : 's'} registrada${petCount === 1 ? '' : 's'}`
            : 'Registra tu primera mascota para poder agendar'}
        </Text>
        <Button
          title="Agendar nueva cita"
          onPress={() => router.push('/(tabs)/appointments/new')}
          className="mt-2"
        />
      </Card>

      <Section
        title="Próximas citas"
        subtitle={
          upcoming.length > 0
            ? `Mostrando ${upcoming.length} cita${upcoming.length === 1 ? '' : 's'}`
            : undefined
        }
      >
        {isLoading ? (
          <Loading label="Buscando próximas citas..." />
        ) : apptsError ? (
          <ErrorState message={getErrorMessage(apptsError)} />
        ) : upcoming.length === 0 ? (
          <Empty
            title="Sin citas próximas"
            description="Cuando agendes una cita aparecerá aquí. Puedes hacerlo tocando el botón de arriba."
          />
        ) : (
          upcoming.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))
        )}
      </Section>

      <Section
        title="Notificaciones"
        subtitle={
          notifications.length > 0
            ? `${notifications.length} reciente${notifications.length === 1 ? '' : 's'}`
            : permissionStatus === null
              ? 'Pendiente de permisos'
              : permissionDenied
                ? 'Permisos desactivados'
                : 'Sin notificaciones nuevas'
        }
        trailing={
          permissionDenied ? (
            <Pressable onPress={() => void requestPermissions()}>
              <Text className="text-sm font-medium text-brand-500">
                Activar
              </Text>
            </Pressable>
          ) : undefined
        }
      >
        {notifications.length === 0 ? (
          <Empty
            title="Aún no hay notificaciones"
            description="Las confirmaciones y recordatorios de tus citas aparecerán aquí."
          />
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-900">
                  {n.title}
                </Text>
                <Text className="text-xs text-gray-400">
                  {formatDate(n.receivedAt)}
                </Text>
              </View>
              {n.body ? (
                <Text className="text-sm text-gray-600">{n.body}</Text>
              ) : null}
            </Card>
          ))
        )}
      </Section>
    </ScrollView>
  );
}
