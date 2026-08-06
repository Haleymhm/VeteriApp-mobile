import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  formatFullDateTime,
  getAppointmentStatus,
} from '@/lib/formatDate';
import { cn } from '@/lib/cn';
import type { AppointmentStatus } from '@/types';

export interface AppointmentRowProps {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
  petName: string;
  categoryName?: string | null;
  vetName?: string | null;
  onPress?: (id: number) => void;
}

function AppointmentRowBase({
  id,
  date,
  reason,
  status,
  notes,
  petName,
  categoryName,
  vetName,
  onPress,
}: AppointmentRowProps) {
  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);

  const statusInfo = getAppointmentStatus(status);
  const isConfirmed = status === 'CONFIRMED' || status === 'COMPLETED';

  const cardTitle = categoryName || 'Consulta general';
  const bottomContent = reason || notes || '.';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de la cita de ${petName}`}
      onPress={handlePress}
      className="active:opacity-90"
    >
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
              label={categoryName || 'Consulta Veterinaria'}
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
              {formatFullDateTime(date)}
            </Text>

            {vetName ? (
              <Text className="text-sm text-gray-500">
                Veterinario: <Text className="font-medium text-gray-700">{vetName}</Text>
              </Text>
            ) : null}
          </View>

          {/* Status Badge and arrow */}
          <View className="items-end gap-2">
            <Badge
              label={statusInfo.label}
              bgClass={cn(
                statusInfo.bg,
                status === 'CONFIRMED' ? 'bg-success-500/10' : ''
              )}
              textClass={cn(
                statusInfo.text,
                status === 'CONFIRMED' ? 'text-success-500' : ''
              )}
            />
            <ChevronRight size={18} color="#9CA3AF" />
          </View>
        </View>

        {/* Reason / Notes container */}
        <View className="rounded-lg bg-gray-50 p-3 mt-1">
          <Text className="text-sm text-gray-700 leading-normal">
            {bottomContent}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export const AppointmentRow = memo(AppointmentRowBase);
