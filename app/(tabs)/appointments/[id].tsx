import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Calendar, Clock, User, FileText, Stethoscope } from 'lucide-react-native';
import { useAppointments, useUpdateAppointment } from '@/hooks/useAppointments';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { formatDate, formatTime, getAppointmentStatus } from '@/lib/formatDate';
import { getErrorMessage } from '@/lib/errors';
import type { AppointmentStatus } from '@/types';

const CANCELLABLE_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED'];

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const appointmentId = Number(params.id);

  const { data: appointments, isLoading, error, refetch } = useAppointments();
  const updateAppointment = useUpdateAppointment(appointmentId);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refetch();
      return () => undefined;
    }, [refetch]),
  );

  const appointment = (appointments ?? []).find((a) => a.id === appointmentId);

  const handleCancel = useCallback(async () => {
    try {
      await updateAppointment.mutateAsync({ status: 'CANCELLED' });
      setShowCancelConfirm(false);
      Alert.alert(
        'Cita cancelada',
        'Tu cita ha sido cancelada. Recibirás un email de confirmación.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }, [updateAppointment, router]);

  if (!Number.isFinite(appointmentId) || appointmentId <= 0) {
    return (
      <View className="flex-1 px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Detalle de cita"
          back={() => router.back()}
        />
        <ErrorState message="ID de cita inválido." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Detalle de cita" back={() => router.back()} />
        <Loading label="Cargando cita..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Detalle de cita" back={() => router.back()} />
        <ErrorState message={getErrorMessage(error)} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Detalle de cita" back={() => router.back()} />
        <Empty title="Cita no encontrada" />
      </View>
    );
  }

  const statusInfo = getAppointmentStatus(appointment.status);
  const petName = appointment.pet?.name ?? 'Mascota';
  const vetName = appointment.vet
    ? `Dr. ${appointment.vet.firstName} ${appointment.vet.lastName}`.trim()
    : null;
  const canCancel = CANCELLABLE_STATUSES.includes(appointment.status);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Detalle de cita"
          subtitle={petName}
          back={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-12"
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <View className="items-center gap-3 py-2">
          <Avatar name={petName} size="xl" />
          <Text className="text-2xl font-bold text-gray-900">{petName}</Text>
          {appointment.category ? (
            <View className="flex-row items-center gap-2">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: appointment.category.color }}
              />
              <Text className="text-base text-gray-600">
                {appointment.category.name}
              </Text>
            </View>
          ) : null}
          <Badge
            label={statusInfo.label}
            bgClass={statusInfo.bg}
            textClass={statusInfo.text}
          />
        </View>

        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-xs text-gray-500">Fecha</Text>
              <Text className="text-base font-medium text-gray-900">
                {formatDate(appointment.date)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-xs text-gray-500">Hora</Text>
              <Text className="text-base font-medium text-gray-900">
                {formatTime(appointment.date)}
              </Text>
            </View>
          </View>

          {vetName ? (
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-xs text-gray-500">Veterinario</Text>
                <Text className="text-base font-medium text-gray-900">
                  {vetName}
                </Text>
              </View>
            </View>
          ) : null}

          {appointment.reason ? (
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Motivo</Text>
                <Text className="text-base font-medium text-gray-900">
                  {appointment.reason}
                </Text>
              </View>
            </View>
          ) : null}
        </Card>

        {appointment.notes ? (
          <Section title="Notas">
            <Card>
              <View className="flex-row items-start gap-3">
                <FileText size={18} color="#6B7280" className="mt-0.5" />
                <Text className="flex-1 text-sm text-gray-700">
                  {appointment.notes}
                </Text>
              </View>
            </Card>
          </Section>
        ) : null}

        {showCancelConfirm ? (
          <Card className="border-danger/30 bg-danger/5 gap-4">
            <View>
              <Text className="text-base font-semibold text-danger">
                ¿Cancelar esta cita?
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Esta acción no se puede deshacer. Te llegará un email de
                confirmación de la cancelación.
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Button
                title="Sí, cancelar"
                variant="primary"
                onPress={handleCancel}
                loading={updateAppointment.isPending}
                className="flex-1"
              />
              <Button
                title="Volver"
                variant="secondary"
                onPress={() => setShowCancelConfirm(false)}
                disabled={updateAppointment.isPending}
                className="flex-1"
              />
            </View>
          </Card>
        ) : canCancel ? (
          <Button
            title="Cancelar cita"
            variant="secondary"
            onPress={() => setShowCancelConfirm(true)}
          />
        ) : appointment.status === 'CANCELLED' ? (
          <View className="rounded-xl border border-danger/20 bg-danger/5 p-4">
            <Text className="text-sm text-danger">
              Esta cita fue cancelada.
            </Text>
          </View>
        ) : appointment.status === 'NO_SHOW' ? (
          <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">
              El cliente no asistió a esta cita.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}