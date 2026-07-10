import { useCallback } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  Syringe,
  Bug,
  AlertCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import { usePet } from '@/hooks/usePets';
import { useMedicalRecords } from '@/hooks/useMedicalRecords';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/formatDate';
import { cn } from '@/lib/cn';
import type { MedicalRecordType } from '@/types';

const RECORD_TYPE_LABELS: Record<MedicalRecordType, string> = {
  CHECKUP: 'Control',
  CONSULTATION: 'Consulta',
  SURGERY: 'Cirugía',
  DENTAL: 'Dental',
  LAB_TEST: 'Laboratorio',
  OTHER: 'Otro',
};

const RECORD_TYPE_COLORS: Record<MedicalRecordType, string> = {
  CHECKUP: 'bg-blue-100 text-blue-700',
  CONSULTATION: 'bg-green-100 text-green-700',
  SURGERY: 'bg-red-100 text-red-700',
  DENTAL: 'bg-purple-100 text-purple-700',
  LAB_TEST: 'bg-yellow-100 text-yellow-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

interface MenuItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
  count?: number;
  onPress: () => void;
}

function MenuItem({ icon: Icon, title, description, count, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon size={24} color="#3B82F6" />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-gray-900">{title}</Text>
          {count !== undefined && count > 0 ? (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-xs font-medium text-white">{count}</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </Pressable>
  );
}

interface RecordItemProps {
  record: {
    id: number;
    date: string;
    type: MedicalRecordType;
    description: string;
    diagnosis?: string | null;
    treatment?: string | null;
    vet?: { firstName: string; lastName: string } | null;
  };
}

function RecordItem({ record }: RecordItemProps) {
  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className={cn(
              'rounded-full px-2 py-1',
              RECORD_TYPE_COLORS[record.type],
            )}
          >
            <Text className="text-xs font-medium">
              {RECORD_TYPE_LABELS[record.type]}
            </Text>
          </View>
          <Calendar size={14} color="#6B7280" />
          <Text className="text-sm text-gray-500">{formatDate(record.date)}</Text>
        </View>
      </View>
      <Text className="text-base font-medium text-gray-900">{record.description}</Text>
      {record.diagnosis ? (
        <Text className="text-sm text-gray-600">Diagnóstico: {record.diagnosis}</Text>
      ) : null}
      {record.treatment ? (
        <Text className="text-sm text-gray-600">Tratamiento: {record.treatment}</Text>
      ) : null}
      {record.vet ? (
        <Text className="text-xs text-gray-400">
          Dr. {record.vet.firstName} {record.vet.lastName}
        </Text>
      ) : null}
    </Card>
  );
}

export default function MedicalRecordsIndexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petIdParam = params.petId;
  const petId = Number(petIdParam);

  const { data: pet, isLoading: isPetLoading } = usePet(
    Number.isFinite(petId) && petId > 0 ? petId : 0,
  );

  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    error: recordsError,
    refetch,
  } = useMedicalRecords(petId);

  useFocusEffect(
    useCallback(() => {
      if (Number.isFinite(petId) && petId > 0) {
        void refetch();
      }
      return () => undefined;
    }, [petId, refetch]),
  );

  const isLoading = isPetLoading || isRecordsLoading;
  const error = recordsError;

  const navigateTo = (path: string) => {
    router.push(`/medical-records/${petId}/${path}` as never);
  };

  const records = recordsData?.data ?? [];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Historial Médico"
          subtitle={pet ? pet.name : undefined}
          back={() => router.back()}
        />
      </View>

      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="px-6">
          <Loading label="Cargando historial médico..." />
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96, gap: 16, paddingHorizontal: 24 }}
        >
          <View className="gap-3">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              Secciones
            </Text>
            <MenuItem
              icon={Syringe}
              title="Vacunas"
              description="Calendario y registro de vacunas"
              onPress={() => navigateTo('vaccinations')}
            />
            <MenuItem
              icon={Bug}
              title="Desparasitación"
              description="Historial de desparasitación interna y externa"
              onPress={() => navigateTo('deworming')}
            />
            <MenuItem
              icon={AlertCircle}
              title="Condiciones Crónicas"
              description="Alergias y condiciones crónicas"
              onPress={() => navigateTo('chronic-conditions')}
            />
          </View>

          <View className="gap-3 pt-4">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              Registros Médicos ({records.length})
            </Text>
            {records.length === 0 ? (
              <Empty
                title="Sin registros médicos"
                description="Los registros médicos aparecerán aquí cuando se agreguen."
              />
            ) : (
              records.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}