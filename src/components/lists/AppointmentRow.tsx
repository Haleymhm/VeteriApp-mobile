import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react-native';
import {
  formatDateTime,
  getAppointmentStatus,
  isFuture,
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
  const future = isFuture(date);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de la cita de ${petName}`}
      onPress={handlePress}
      className="active:opacity-90"
    >
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <Avatar name={petName} />
          <View className="flex-1 gap-1">
            <Text
              className="text-base font-semibold text-gray-900"
              numberOfLines={1}
            >
              {petName}
              {categoryName ? (
                <Text className="font-normal text-gray-500">
                  {' · '}
                  {categoryName}
                </Text>
              ) : null}
            </Text>
            <Text
              className={cn(
                'text-sm',
                future ? 'text-primary' : 'text-gray-600',
              )}
            >
              {formatDateTime(date)}
            </Text>
            {vetName ? (
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {vetName}
              </Text>
            ) : null}
          </View>
          <Badge
            label={statusInfo.label}
            bgClass={statusInfo.bg}
            textClass={statusInfo.text}
          />
          <ChevronRight size={18} color="#9CA3AF" />
        </View>
        {reason ? (
          <Text className="text-sm text-gray-700" numberOfLines={2}>
            {reason}
          </Text>
        ) : null}
        {notes ? (
          <Text className="text-xs text-gray-500" numberOfLines={2}>
            {notes}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

export const AppointmentRow = memo(AppointmentRowBase);
