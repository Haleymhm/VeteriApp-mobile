import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react-native';
import { formatFullDateTime, getAppointmentStatus } from '@/lib/formatDate';
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
  const isConfirmed = appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED';

  const cardTitle = appointment.category?.name || 'Consulta general';
  const bottomContent = appointment.reason || appointment.notes || '.';

  return (
    <Card className="gap-3 p-4 bg-white border border-gray-200 rounded-2xl">
      <View className="flex-row items-start gap-3">
        {/* Checkmark status indicator */}
        <View
          className={cn(
            'h-6 w-6 items-center justify-center rounded-md mt-1',
            isConfirmed ? 'bg-success-500' : 'bg-gray-300'
          )}
        >
          <Check size={16} color="white" strokeWidth={3} />
        </View>

        {/* Content info */}
        <View className="flex-1 gap-1">
          <Badge
            label={appointment.category?.name || 'Consulta Veterinaria'}
            bgClass="bg-blue-light-25 border border-blue-light-500/10"
            textClass="text-blue-light-500"
            className="mb-1"
          />

          <Text className="text-base font-bold text-gray-900">
            {cardTitle}
          </Text>

          <Text className="text-sm text-gray-600">
            Mascota: <Text className="font-semibold text-gray-800">{petName}</Text>
          </Text>

          <Text className="text-sm text-gray-500">
            {formatFullDateTime(appointment.date)}
          </Text>

          {vet ? (
            <Text className="text-sm text-gray-500">
              Veterinario: <Text className="font-medium text-gray-700">{vet}</Text>
            </Text>
          ) : null}
        </View>

        {/* Status Badge */}
        {showStatus ? (
          <Badge
            label={status.label}
            bgClass={cn(
              status.bg,
              appointment.status === 'CONFIRMED' ? 'bg-success-500/10' : ''
            )}
            textClass={cn(
              status.text,
              appointment.status === 'CONFIRMED' ? 'text-success-500' : ''
            )}
          />
        ) : null}
      </View>

      {/* Reason / Notes container */}
      <View className="rounded-lg bg-gray-50 p-3 mt-1">
        <Text className="text-sm text-gray-700 leading-normal">
          {bottomContent}
        </Text>
      </View>
    </Card>
  );
}
