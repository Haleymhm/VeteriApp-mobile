import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, getAppointmentStatus, isFuture } from '@/lib/formatDate';
import { cn } from '@/lib/cn';
import type { Appointment } from '@/types';

export interface AppointmentCardProps {
  appointment: Appointment;
  showStatus?: boolean;
}

export function AppointmentCard({
  appointment,
  showStatus = true,
}: AppointmentCardProps) {
  const status = getAppointmentStatus(appointment.status);
  const petName = appointment.pet?.name ?? 'Mascota';
  const vet = appointment.vet
    ? `Dr. ${appointment.vet.firstName} ${appointment.vet.lastName}`.trim()
    : null;
  const future = isFuture(appointment.date);

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <Avatar name={petName} />
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-gray-900">
            {petName}
            {appointment.category?.name ? (
              <Text className="font-normal text-gray-500">
                {' · '}
                {appointment.category.name}
              </Text>
            ) : null}
          </Text>
          <Text className={cn('text-sm', future ? 'text-primary' : 'text-gray-600')}>
            {formatDateTime(appointment.date)}
          </Text>
          {vet ? (
            <Text className="text-xs text-gray-500">{vet}</Text>
          ) : null}
        </View>
        {showStatus ? (
          <Badge label={status.label} bgClass={status.bg} textClass={status.text} />
        ) : null}
      </View>
      {appointment.reason ? (
        <Text className="text-sm text-gray-700">{appointment.reason}</Text>
      ) : null}
      {appointment.notes ? (
        <Text className="text-xs text-gray-500">{appointment.notes}</Text>
      ) : null}
    </Card>
  );
}
