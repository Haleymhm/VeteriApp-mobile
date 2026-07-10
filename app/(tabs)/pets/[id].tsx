import { useCallback } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { usePet } from '@/hooks/usePets';
import { useAppointments } from '@/hooks/useAppointments';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppointmentCard } from '@/components/lists/AppointmentCard';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, isFuture } from '@/lib/formatDate';
import type { Sex, ReproductiveStatus } from '@/types';

const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Macho',
  FEMALE: 'Hembra',
};

const REPRODUCTIVE_LABELS: Record<ReproductiveStatus, string> = {
  FERTILE: 'Fértil',
  STERILIZED: 'Esterilizada',
  CASTRATED: 'Castrado',
};

interface DetailRowProps {
  label: string;
  value?: string | null;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
        {value && value.length > 0 ? value : '—'}
      </Text>
    </View>
  );
}

export default function PetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const idParam = params.id;
  const petId = Number(idParam);

  const { data: pet, isLoading, error, refetch } = usePet(
    Number.isFinite(petId) ? petId : 0,
  );

  useFocusEffect(
    useCallback(() => {
      if (Number.isFinite(petId) && petId > 0) {
        void refetch();
      }
      return () => undefined;
    }, [petId, refetch]),
  );

  const { data: appointments } = useAppointments();

  const petAppointments = (appointments ?? [])
    .filter((a) => a.petId === petId)
    .sort((x, y) => x.date.localeCompare(y.date));

  const upcomingForPet = petAppointments.filter(
    (a) => isFuture(a.date) && a.status !== 'CANCELLED',
  );

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6">
        <ScreenHeader
          title="Detalle de mascota"
          subtitle={
            pet ? `${pet.species}${pet.breed ? ` · ${pet.breed}` : ''}` : undefined
          }
          back={() => router.back()}
        />
      </View>
      {!Number.isFinite(petId) || petId <= 0 ? (
        <View className="px-6">
          <ErrorState message="Mascota inválida" />
        </View>
      ) : isLoading ? (
        <View className="px-6">
          <Loading label="Cargando mascota..." />
        </View>
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : !pet ? (
        <View className="px-6">
          <Empty title="Mascota no encontrada" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 64 }}
          contentContainerClassName="gap-6 px-6"
        >
          <View className="items-center gap-3 py-2">
            <Avatar name={pet.name} imageUrl={null} size="xl" />
            <Text className="text-2xl font-bold text-gray-900">
              {pet.name}
            </Text>
            <View className="flex-row gap-2">
              <Badge label={pet.species} bgClass="bg-primary/10" textClass="text-primary" />
              {pet.sex ? (
                <Badge
                  label={SEX_LABELS[pet.sex]}
                  bgClass="bg-gray-100"
                  textClass="text-gray-700"
                />
              ) : null}
            </View>
          </View>

          <Card className="gap-1 divide-y divide-gray-100">
            <DetailRow label="Especie" value={pet.species} />
            <DetailRow label="Raza" value={pet.breed} />
            <DetailRow
              label="Fecha de nacimiento"
              value={pet.birthDate ? formatDate(pet.birthDate) : null}
            />
            <DetailRow
              label="Peso"
              value={pet.weight != null ? `${pet.weight} kg` : null}
            />
            {pet.sex ? (
              <DetailRow label="Sexo" value={SEX_LABELS[pet.sex]} />
            ) : null}
            {pet.reproductiveStatus ? (
              <DetailRow
                label="Estado reproductivo"
                value={REPRODUCTIVE_LABELS[pet.reproductiveStatus]}
              />
            ) : null}
            <DetailRow
              label="N° microchip"
              value={pet.microchipNumber}
            />
          </Card>

          {pet.specialCharacteristics ? (
            <Section title="Características especiales">
              <Card>
                <Text className="text-sm text-gray-700">
                  {pet.specialCharacteristics}
                </Text>
              </Card>
            </Section>
          ) : null}

          <Section
            title="Próximas citas"
            subtitle={
              upcomingForPet.length > 0
                ? `${upcomingForPet.length} cita${upcomingForPet.length === 1 ? '' : 's'} próxima${upcomingForPet.length === 1 ? '' : 's'}`
                : 'Sin citas próximas'
            }
          >
            {upcomingForPet.length === 0 ? (
              <Empty
                title="Sin citas próximas"
                description="Agenda una nueva cita desde la pestaña Citas."
              />
            ) : (
              upcomingForPet.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))
            )}
          </Section>

          {petAppointments.length > upcomingForPet.length ? (
            <Section
              title="Historial Médico"
              subtitle={`${petAppointments.length - upcomingForPet.length} cita(s) pasadas o canceladas`}
            >
              <Pressable
                onPress={() =>
                  router.push(`/medical-records/${petId}` as never)
                }
                className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
              >
                <View className="gap-1">
                  <Text className="text-base font-medium text-gray-900">
                    Ver historial médico
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Consultas, vacunas, desparasitación y más
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </Pressable>
            </Section>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
