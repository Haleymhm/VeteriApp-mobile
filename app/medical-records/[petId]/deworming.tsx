import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Bug, Calendar, Check } from 'lucide-react-native';
import { usePet } from '@/hooks/usePets';
import { useDeworming } from '@/hooks/useMedicalRecords';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, isFuture } from '@/lib/formatDate';
import type { DewormingType } from '@/types';

const DEWORMING_TYPE_LABELS: Record<DewormingType, string> = {
  INTERNAL: 'Interna',
  EXTERNAL: 'Externa',
  BOTH: 'Interna y Externa',
};

const DEWORMING_TYPE_COLORS: Record<DewormingType, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-purple-100 text-purple-700',
  BOTH: 'bg-green-100 text-green-700',
};

interface DewormingItemProps {
  deworming: {
    id: number;
    date: string;
    type: DewormingType;
    product?: string | null;
    dose?: string | null;
    veterinarian?: string | null;
    nextDueDate?: string | null;
    notes?: string | null;
  };
}

function DewormingItem({ deworming }: DewormingItemProps) {
  const isDue = deworming.nextDueDate && !isFuture(deworming.nextDueDate);

  return (
    <Card className="gap-2">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <Bug size={18} color="#8B5CF6" />
          <Text className="text-base font-semibold text-gray-900">
            Desparasitación {DEWORMING_TYPE_LABELS[deworming.type]}
          </Text>
        </View>
        <Badge
          label={DEWORMING_TYPE_LABELS[deworming.type]}
          bgClass={DEWORMING_TYPE_COLORS[deworming.type]}
          textClass="text-xs"
        />
      </View>

      <View className="flex-row items-center gap-2">
        <Calendar size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600">
          Fecha: {formatDate(deworming.date)}
        </Text>
      </View>

      {deworming.product && (
        <Text className="text-sm text-gray-700">
          Producto: {deworming.product}
          {deworming.dose ? ` · ${deworming.dose}` : ''}
        </Text>
      )}

      {deworming.veterinarian && (
        <Text className="text-xs text-gray-500">
          Veterinario: {deworming.veterinarian}
        </Text>
      )}

      {deworming.nextDueDate && (
        <View className="flex-row items-center gap-2">
          <Check size={14} color={isDue ? '#EF4444' : '#10B981'} />
          <Text
            className={`text-sm ${isDue ? 'text-red-600' : 'text-green-600'}`}
          >
            {isDue ? 'Vencida' : 'Próxima'}: {formatDate(deworming.nextDueDate)}
          </Text>
        </View>
      )}

      {deworming.notes && (
        <Text className="text-sm text-gray-600">{deworming.notes}</Text>
      )}
    </Card>
  );
}

export default function DewormingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petIdParam = params.petId;
  const petId = Number(petIdParam);

  const { data: pet, isLoading: isPetLoading } = usePet(
    Number.isFinite(petId) && petId > 0 ? petId : 0,
  );

  const {
    data: dewormingData,
    isLoading: isDewormingLoading,
    error: dewormingError,
    refetch,
  } = useDeworming(petId);

  useFocusEffect(
    useCallback(() => {
      if (Number.isFinite(petId) && petId > 0) {
        void refetch();
      }
      return () => undefined;
    }, [petId, refetch]),
  );

  const isLoading = isPetLoading || isDewormingLoading;
  const error = dewormingError;
  const dewormings = dewormingData?.data ?? [];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Desparasitación"
          subtitle={pet ? `${pet.name} · Desparasitación` : undefined}
          back={() => router.back()}
        />
      </View>

      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="px-6">
          <Loading label="Cargando desparasitación..." />
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : dewormings.length === 0 ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 96 }}>
          <Empty
            title="Sin registros de desparasitación"
            description="Los tratamientos de desparasitación aparecerán aquí."
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96, gap: 12, paddingHorizontal: 24 }}
        >
          <Text className="pb-2 text-xs text-gray-500">
            {dewormings.length === 1
              ? '1 registro'
              : `${dewormings.length} registros`}
          </Text>
          {dewormings.map((d) => (
            <DewormingItem key={d.id} deworming={d} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}