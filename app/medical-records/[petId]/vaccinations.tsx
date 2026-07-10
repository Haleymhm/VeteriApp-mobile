import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Syringe, Calendar, AlertCircle } from 'lucide-react-native';
import { usePet } from '@/hooks/usePets';
import { useVaccinations } from '@/hooks/useMedicalRecords';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, isFuture } from '@/lib/formatDate';
import { cn } from '@/lib/cn';

interface VaccinationItemProps {
  vaccination: {
    id: number;
    vaccineName: string;
    date: string;
    nextDueDate?: string | null;
    batchNumber?: string | null;
    veterinarian?: string | null;
    clinic?: string | null;
    notes?: string | null;
  };
}

function VaccinationItem({ vaccination }: VaccinationItemProps) {
  const isOverdue = vaccination.nextDueDate && !isFuture(vaccination.nextDueDate);

  return (
    <Card className="gap-2">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <Syringe size={18} color="#3B82F6" />
          <Text className="text-base font-semibold text-gray-900">
            {vaccination.vaccineName}
          </Text>
        </View>
        {vaccination.nextDueDate && (
          <Badge
            label={isOverdue ? 'Vencida' : 'Próxima'}
            bgClass={isOverdue ? 'bg-red-100' : 'bg-green-100'}
            textClass={isOverdue ? 'text-red-700' : 'text-green-700'}
          />
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <Calendar size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600">
          Aplicada: {formatDate(vaccination.date)}
        </Text>
      </View>

      {vaccination.nextDueDate && (
        <View className="flex-row items-center gap-2">
          <AlertCircle size={14} color={isOverdue ? '#EF4444' : '#10B981'} />
          <Text
            className={cn(
              'text-sm',
              isOverdue ? 'text-red-600' : 'text-green-600',
            )}
          >
            Próxima dosis: {formatDate(vaccination.nextDueDate)}
          </Text>
        </View>
      )}

      {vaccination.batchNumber && (
        <Text className="text-xs text-gray-500">
          Lote: {vaccination.batchNumber}
        </Text>
      )}

      {vaccination.veterinarian && (
        <Text className="text-xs text-gray-500">
          Veterinario: {vaccination.veterinarian}
        </Text>
      )}

      {vaccination.clinic && (
        <Text className="text-xs text-gray-500">Clínica: {vaccination.clinic}</Text>
      )}

      {vaccination.notes && (
        <Text className="text-sm text-gray-600">{vaccination.notes}</Text>
      )}
    </Card>
  );
}

export default function VaccinationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petIdParam = params.petId;
  const petId = Number(petIdParam);

  const { data: pet, isLoading: isPetLoading } = usePet(
    Number.isFinite(petId) && petId > 0 ? petId : 0,
  );

  const {
    data: vaccinationsData,
    isLoading: isVaccinationsLoading,
    error: vaccinationsError,
    refetch,
  } = useVaccinations(petId);

  useFocusEffect(
    useCallback(() => {
      if (Number.isFinite(petId) && petId > 0) {
        void refetch();
      }
      return () => undefined;
    }, [petId, refetch]),
  );

  const isLoading = isPetLoading || isVaccinationsLoading;
  const error = vaccinationsError;
  const vaccinations = vaccinationsData?.data ?? [];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Vacunas"
          subtitle={pet ? `${pet.name} · Vacunas` : undefined}
          back={() => router.back()}
        />
      </View>

      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="px-6">
          <Loading label="Cargando vacunas..." />
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : vaccinations.length === 0 ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 96 }}>
          <Empty
            title="Sin registros de vacunas"
            description="Las vacunas aplicadas aparecerán aquí."
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96, gap: 12, paddingHorizontal: 24 }}
          refreshControl={
            <View /> // RefreshControl not available without FlatList
          }
        >
          <Text className="pb-2 text-xs text-gray-500">
            {vaccinations.length === 1
              ? '1 vacuna registrada'
              : `${vaccinations.length} vacunas registradas`}
          </Text>
          {vaccinations.map((v) => (
            <VaccinationItem key={v.id} vaccination={v} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}