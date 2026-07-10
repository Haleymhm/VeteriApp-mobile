import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { AlertTriangle, Activity, Clock } from 'lucide-react-native';
import { usePet } from '@/hooks/usePets';
import { useChronicConditions } from '@/hooks/useMedicalRecords';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/formatDate';
import type { ConditionSeverity } from '@/types';

const SEVERITY_CONFIG: Record<
  ConditionSeverity,
  { label: string; bgClass: string; textClass: string }
> = {
  MILD: { label: 'Leve', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  MODERATE: {
    label: 'Moderada',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  SEVERE: { label: 'Severa', bgClass: 'bg-red-100', textClass: 'text-red-700' },
};

interface ConditionItemProps {
  condition: {
    id: number;
    condition: string;
    severity: ConditionSeverity;
    diagnosedDate?: string | null;
    notes?: string | null;
    isActive: boolean;
    updatedAt: string;
  };
}

function ConditionItem({ condition }: ConditionItemProps) {
  const severityConfig = SEVERITY_CONFIG[condition.severity];

  return (
    <Card className="gap-2">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <AlertTriangle size={18} color="#EF4444" />
          <Text className="text-base font-semibold text-gray-900">
            {condition.condition}
          </Text>
        </View>
        <Badge
          label={severityConfig.label}
          bgClass={severityConfig.bgClass}
          textClass={severityConfig.textClass}
        />
      </View>

      <View className="flex-row items-center gap-2">
        <Activity size={14} color="#6B7280" />
        <Text
          className={`text-sm ${condition.isActive ? 'text-green-600' : 'text-gray-500'}`}
        >
          {condition.isActive ? 'Activa' : 'Resuelta'}
        </Text>
      </View>

      {condition.diagnosedDate && (
        <View className="flex-row items-center gap-2">
          <Clock size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600">
            Diagnosticada: {formatDate(condition.diagnosedDate)}
          </Text>
        </View>
      )}

      {condition.notes && (
        <Text className="text-sm text-gray-600 mt-1">{condition.notes}</Text>
      )}
    </Card>
  );
}

export default function ChronicConditionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petIdParam = params.petId;
  const petId = Number(petIdParam);

  const { data: pet, isLoading: isPetLoading } = usePet(
    Number.isFinite(petId) && petId > 0 ? petId : 0,
  );

  const {
    data: conditionsData,
    isLoading: isConditionsLoading,
    error: conditionsError,
    refetch,
    isRefetching,
  } = useChronicConditions(petId);

  useFocusEffect(
    useCallback(() => {
      if (Number.isFinite(petId) && petId > 0) {
        void refetch();
      }
      return () => undefined;
    }, [petId, refetch]),
  );

  const isLoading = isPetLoading || isConditionsLoading;
  const error = conditionsError;
  const conditions = conditionsData?.data ?? [];
  const activeConditions = conditions.filter((c) => c.isActive);
  const resolvedConditions = conditions.filter((c) => !c.isActive);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Condiciones Crónicas"
          subtitle={pet ? `${pet.name} · Condiciones` : undefined}
          back={() => router.back()}
        />
      </View>

      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="px-6">
          <Loading label="Cargando condiciones..." />
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : conditions.length === 0 ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 96 }}>
          <Empty
            title="Sin condiciones registradas"
            description="Las alergias y condiciones crónicas aparecerán aquí."
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96, gap: 16, paddingHorizontal: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          {activeConditions.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-gray-500 uppercase">
                Activas ({activeConditions.length})
              </Text>
              {activeConditions.map((c) => (
                <ConditionItem key={c.id} condition={c} />
              ))}
            </View>
          )}

          {resolvedConditions.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-gray-500 uppercase">
                Resueltas ({resolvedConditions.length})
              </Text>
              {resolvedConditions.map((c) => (
                <ConditionItem key={c.id} condition={c} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}