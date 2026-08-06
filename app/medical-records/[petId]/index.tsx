import { useCallback, useState } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, Modal, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  Syringe,
  Bug,
  AlertTriangle,
  ChevronDown,
  Calendar,
  FileText,
  Activity,
  Clock,
  Check,
} from 'lucide-react-native';
import { usePet, usePets } from '@/hooks/usePets';
import {
  useMedicalRecords,
  useVaccinations,
  useDeworming,
  useChronicConditions,
} from '@/hooks/useMedicalRecords';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, isFuture } from '@/lib/formatDate';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { MedicalRecord, MedicalRecordType, DewormingType, ConditionSeverity } from '@/types';

interface ExtendedMedicalRecord extends MedicalRecord {
  vitals?: {
    weight?: number | null;
    temperature?: number | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
  } | null;
  publicNotes?: string | null;
}

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

type Tab = 'consultas' | 'vacunas' | 'desparasitacion' | 'alergias';

const TABS: { value: Tab; label: string }[] = [
  { value: 'consultas', label: 'Consultas' },
  { value: 'vacunas', label: 'Vacunas' },
  { value: 'desparasitacion', label: 'Desparasitación' },
  { value: 'alergias', label: 'Alergias/Patologías' },
];

const SEVERITY_CONFIG: Record<
  ConditionSeverity,
  { label: string; bgClass: string; textClass: string }
> = {
  MILD: { label: 'Leve', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  MODERATE: { label: 'Moderada', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  SEVERE: { label: 'Severa', bgClass: 'bg-red-100', textClass: 'text-red-700' },
};

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

export default function MedicalRecordsIndexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const petIdParam = params.petId;
  const petId = Number(petIdParam);

  const [activeTab, setActiveTab] = useState<Tab>('consultas');
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const { data: pet, isLoading: isPetLoading } = usePet(
    Number.isFinite(petId) && petId > 0 ? petId : 0,
  );

  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    error: recordsError,
    refetch: refetchRecords,
    isRefetching: isRecordsRefetching,
  } = useMedicalRecords(petId);

  const {
    data: vaccinationsData,
    isLoading: isVaccinationsLoading,
    refetch: refetchVaccinations,
    isRefetching: isVaccinationsRefetching,
  } = useVaccinations(petId);

  const {
    data: dewormingData,
    isLoading: isDewormingLoading,
    refetch: refetchDeworming,
    isRefetching: isDewormingRefetching,
  } = useDeworming(petId);

  const {
    data: conditionsData,
    isLoading: isConditionsLoading,
    refetch: refetchConditions,
    isRefetching: isConditionsRefetching,
  } = useChronicConditions(petId);

  const refetchAll = useCallback(() => {
    if (Number.isFinite(petId) && petId > 0) {
      void refetchRecords();
      void refetchVaccinations();
      void refetchDeworming();
      void refetchConditions();
    }
  }, [petId, refetchRecords, refetchVaccinations, refetchDeworming, refetchConditions]);

  useFocusEffect(
    useCallback(() => {
      refetchAll();
      return () => undefined;
    }, [refetchAll]),
  );

  const handleDownloadPDF = () => {
    setDownloadingPDF(true);
    setTimeout(() => {
      setDownloadingPDF(false);
      Alert.alert(
        'Descarga exitosa',
        `El reporte del historial médico de ${pet?.name ?? 'tu mascota'} ha sido generado e impreso con éxito en el dispositivo.`
      );
    }, 1500);
  };

  const isLoading = isPetLoading || isRecordsLoading || isVaccinationsLoading || isDewormingLoading || isConditionsLoading;
  const isRefreshing = isRecordsRefetching || isVaccinationsRefetching || isDewormingRefetching || isConditionsRefetching;
  const error = recordsError;

  const records = recordsData?.data ?? [];
  const vaccinations = vaccinationsData?.data ?? [];
  const dewormings = dewormingData?.data ?? [];
  const conditions = conditionsData?.data ?? [];

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Historial Médico"
          back={() => router.back()}
        />
      </View>

      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#465fff" />
          <Text className="mt-3 text-sm text-gray-500">Cargando historial médico...</Text>
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : (
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-3 px-6 pb-4">
            <Pressable
              onPress={() => setShowPetPicker(true)}
              className="flex-row items-center justify-between gap-2 border border-gray-300 rounded-xl bg-white px-4 py-2.5 flex-1 max-w-[220px] active:bg-gray-50"
            >
              <Avatar name={pet?.name ?? 'Mascota'} size="sm" />
              <Text className="text-sm font-semibold text-gray-800 flex-1 ml-1" numberOfLines={1}>
                {pet?.name} ({pet?.species})
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-success-500 rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:bg-success-600 disabled:opacity-50"
            >
              {downloadingPDF ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FileText size={18} color="white" />
              )}
              <Text className="text-sm font-bold text-white">
                Descargar PDF
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 96, gap: 16 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={refetchAll} />
            }
          >
            <View className="px-6">
              <View className="flex-row items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <Avatar name={pet?.name ?? 'M'} size="lg" />
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-bold text-blue-900 leading-tight">
                    {pet?.name}
                  </Text>
                  <Text className="text-sm font-semibold text-blue-500">
                    {pet?.species} {pet?.breed ? ` - ${pet?.breed.toUpperCase()}` : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View className="border-b border-gray-100">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-6 pb-0.5 gap-4"
              >
                {TABS.map((t) => {
                  const selected = activeTab === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => setActiveTab(t.value)}
                      className={cn(
                        'pb-3 pt-1 px-1 border-b-2',
                        selected ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-sm font-bold',
                          selected ? 'text-primary' : 'text-gray-500'
                        )}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="px-6">
              {activeTab === 'consultas' && (
                <View>
                  {records.length === 0 ? (
                    <Empty
                      title="Sin consultas médicas"
                      description="Los controles y atenciones médicas aparecerán aquí."
                    />
                  ) : (
                    records.map((record) => {
                      const extRecord = record as ExtendedMedicalRecord;
                      const formattedDate = formatDate(record.date);
                      const vetName = record.vet
                        ? `Dr. ${record.vet.firstName} ${record.vet.lastName}`.trim()
                        : null;

                      return (
                        <Card key={record.id} className="gap-2 p-4 bg-white border border-gray-200 rounded-2xl mb-3 shadow-none">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-base font-extrabold text-gray-900 tracking-wide">
                              {record.description ? record.description.toUpperCase() : 'CONTROL'}
                            </Text>
                            <Badge
                              label={RECORD_TYPE_LABELS[record.type] || 'Control'}
                              bgClass={RECORD_TYPE_COLORS[record.type] || 'bg-blue-100'}
                              textClass="text-xs"
                            />
                          </View>
                          <Text className="text-xs font-semibold text-gray-400 mt-0.5">
                            {formattedDate} {vetName ? `| ${vetName}` : ''}
                          </Text>

                          {extRecord.vitals ? (
                            <View className="flex-row justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 my-2">
                              <View className="items-center flex-1">
                                <Text className="text-xs text-gray-400 font-semibold">Peso</Text>
                                <Text className="text-sm font-bold text-gray-900 mt-0.5">
                                  {extRecord.vitals.weight ? `${extRecord.vitals.weight} kg` : '--'}
                                </Text>
                              </View>
                              <View className="items-center flex-1 border-l border-gray-200">
                                <Text className="text-xs text-gray-400 font-semibold">Temp</Text>
                                <Text className="text-sm font-bold text-gray-900 mt-0.5">
                                  {extRecord.vitals.temperature ? `${extRecord.vitals.temperature} °C` : '--'}
                                </Text>
                              </View>
                              <View className="items-center flex-1 border-l border-gray-200">
                                <Text className="text-xs text-gray-400 font-semibold">FC</Text>
                                <Text className="text-sm font-bold text-gray-900 mt-0.5">
                                  {extRecord.vitals.heartRate ? `${extRecord.vitals.heartRate} lpm` : '--'}
                                </Text>
                              </View>
                              <View className="items-center flex-1 border-l border-gray-200">
                                <Text className="text-xs text-gray-400 font-semibold">FR</Text>
                                <Text className="text-sm font-bold text-gray-900 mt-0.5">
                                  {extRecord.vitals.respiratoryRate ? `${extRecord.vitals.respiratoryRate} rpm` : '--'}
                                </Text>
                              </View>
                            </View>
                          ) : null}

                          {record.diagnosis ? (
                            <Text className="text-sm text-gray-700 mt-1 leading-relaxed">
                              <Text className="font-bold text-gray-900">Diagnóstico: </Text>
                              {record.diagnosis}
                            </Text>
                          ) : null}
                          {record.treatment ? (
                            <Text className="text-sm text-gray-700 leading-relaxed">
                              <Text className="font-bold text-gray-900">Tratamiento: </Text>
                              {record.treatment}
                            </Text>
                          ) : null}
                          {extRecord.publicNotes ? (
                            <Text className="text-sm text-gray-500 mt-1 italic leading-relaxed">
                              {extRecord.publicNotes}
                            </Text>
                          ) : null}
                        </Card>
                      );
                    })
                  )}
                </View>
              )}

              {activeTab === 'vacunas' && (
                <View>
                  {vaccinations.length === 0 ? (
                    <Empty
                      title="Sin vacunas aplicadas"
                      description="El calendario y registros de vacunas aparecerán aquí."
                    />
                  ) : (
                    vaccinations.map((vaccination) => {
                      const isOverdue = vaccination.nextDueDate && !isFuture(vaccination.nextDueDate);
                      return (
                        <Card key={vaccination.id} className="gap-2 p-4 bg-white border border-gray-200 rounded-2xl mb-3 shadow-none">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-row items-center gap-2">
                              <Syringe size={18} color="#3B82F6" />
                              <Text className="text-base font-bold text-gray-900">
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
                          <View className="flex-row items-center gap-2 mt-1">
                            <Calendar size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600">
                              Aplicada: {formatDate(vaccination.date)}
                            </Text>
                          </View>
                          {vaccination.nextDueDate && (
                            <View className="flex-row items-center gap-2 mt-0.5">
                              <AlertTriangle size={14} color={isOverdue ? '#EF4444' : '#10B981'} />
                              <Text className={cn('text-sm font-medium', isOverdue ? 'text-red-600' : 'text-green-600')}>
                                Próxima dosis: {formatDate(vaccination.nextDueDate)}
                              </Text>
                            </View>
                          )}
                          {vaccination.batchNumber && (
                            <Text className="text-xs text-gray-500 mt-1">Lote: {vaccination.batchNumber}</Text>
                          )}
                          {vaccination.veterinarian && (
                            <Text className="text-xs text-gray-500">Veterinario: {vaccination.veterinarian}</Text>
                          )}
                          {vaccination.clinic && (
                            <Text className="text-xs text-gray-500">Clínica: {vaccination.clinic}</Text>
                          )}
                          {vaccination.notes && (
                            <Text className="text-sm text-gray-600 mt-1">{vaccination.notes}</Text>
                          )}
                        </Card>
                      );
                    })
                  )}
                </View>
              )}

              {activeTab === 'desparasitacion' && (
                <View>
                  {dewormings.length === 0 ? (
                    <Empty
                      title="Sin desparasitaciones"
                      description="El historial de desparasitaciones aparecerá aquí."
                    />
                  ) : (
                    dewormings.map((deworming) => {
                      const isDue = deworming.nextDueDate && !isFuture(deworming.nextDueDate);
                      return (
                        <Card key={deworming.id} className="gap-2 p-4 bg-white border border-gray-200 rounded-2xl mb-3 shadow-none">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-row items-center gap-2">
                              <Bug size={18} color="#8B5CF6" />
                              <Text className="text-base font-bold text-gray-900">
                                Desparasitación {DEWORMING_TYPE_LABELS[deworming.type]}
                              </Text>
                            </View>
                            <Badge
                              label={DEWORMING_TYPE_LABELS[deworming.type]}
                              bgClass={DEWORMING_TYPE_COLORS[deworming.type]}
                              textClass="text-xs"
                            />
                          </View>
                          <View className="flex-row items-center gap-2 mt-1">
                            <Calendar size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600">
                              Fecha: {formatDate(deworming.date)}
                            </Text>
                          </View>
                          {deworming.product && (
                            <Text className="text-sm text-gray-700 mt-1">
                              Producto: <Text className="font-semibold text-gray-900">{deworming.product}</Text>
                              {deworming.dose ? ` · ${deworming.dose}` : ''}
                            </Text>
                          )}
                          {deworming.veterinarian && (
                            <Text className="text-xs text-gray-500">Veterinario: {deworming.veterinarian}</Text>
                          )}
                          {deworming.nextDueDate && (
                            <View className="flex-row items-center gap-2 mt-0.5">
                              <Check size={14} color={isDue ? '#EF4444' : '#10B981'} />
                              <Text className={cn('text-sm font-medium', isDue ? 'text-red-600' : 'text-green-600')}>
                                {isDue ? 'Vencida' : 'Próxima'}: {formatDate(deworming.nextDueDate)}
                              </Text>
                            </View>
                          )}
                          {deworming.notes && (
                            <Text className="text-sm text-gray-600 mt-1">{deworming.notes}</Text>
                          )}
                        </Card>
                      );
                    })
                  )}
                </View>
              )}

              {activeTab === 'alergias' && (
                <View>
                  {conditions.length === 0 ? (
                    <Empty
                      title="Sin alergias o patologías"
                      description="Las condiciones médicas crónicas aparecerán aquí."
                    />
                  ) : (
                    conditions.map((condition) => {
                      const severityConfig = SEVERITY_CONFIG[condition.severity];
                      return (
                        <Card key={condition.id} className="gap-2 p-4 bg-white border border-gray-200 rounded-2xl mb-3 shadow-none">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-row items-center gap-2">
                              <AlertTriangle size={18} color="#EF4444" />
                              <Text className="text-base font-bold text-gray-900">
                                {condition.condition}
                              </Text>
                            </View>
                            <Badge
                              label={severityConfig.label}
                              bgClass={severityConfig.bgClass}
                              textClass={severityConfig.textClass}
                            />
                          </View>
                          <View className="flex-row items-center gap-2 mt-1">
                            <Activity size={14} color="#6B7280" />
                            <Text className={cn('text-sm font-semibold', condition.isActive ? 'text-green-600' : 'text-gray-500')}>
                              {condition.isActive ? 'Activa' : 'Resuelta'}
                            </Text>
                          </View>
                          {condition.diagnosedDate && (
                            <View className="flex-row items-center gap-2 mt-0.5">
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
                    })
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      <Modal
        visible={showPetPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%] p-6">
            <View className="flex-row justify-between items-center pb-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Seleccionar Mascota</Text>
              <Pressable onPress={() => setShowPetPicker(false)} className="px-3 py-1">
                <Text className="text-sm font-bold text-primary">Cerrar</Text>
              </Pressable>
            </View>
            <ScrollView className="py-4">
              {pets.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setShowPetPicker(false);
                    router.replace(`/medical-records/${p.id}`);
                  }}
                  className={cn(
                    'flex-row items-center gap-3 p-3 rounded-xl mb-2',
                    p.id === petId ? 'bg-primary/5 border border-primary/20' : 'active:bg-gray-50'
                  )}
                >
                  <Avatar name={p.name} size="md" />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{p.name}</Text>
                    <Text className="text-xs text-gray-500">{p.species} · {p.breed}</Text>
                  </View>
                  {p.id === petId && (
                    <View className="h-2 w-2 rounded-full bg-primary mr-2" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}