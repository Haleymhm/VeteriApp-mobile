import { View, Text, ScrollView } from 'react-native';
import { usePets } from '@/hooks/usePets';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Avatar } from '@/components/ui/Avatar';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/formatDate';

export default function PetsTabScreen() {
  const { data, isLoading, error } = usePets();

  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-12 pt-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-gray-900">Mis mascotas</Text>
        <Text className="text-sm text-gray-500">
          Aquí verás todas tus mascotas registradas.
        </Text>
      </View>

      <Section title="Listado">
        {isLoading ? (
          <Loading label="Cargando mascotas..." />
        ) : error ? (
          <ErrorState message={getErrorMessage(error)} />
        ) : data && data.data.length > 0 ? (
          data.data.map((pet) => (
            <Card key={pet.id} className="flex-row items-center gap-3">
              <Avatar name={pet.name} size="lg" />
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-gray-900">
                  {pet.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {pet.species}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                </Text>
                {pet.birthDate ? (
                  <Text className="text-xs text-gray-400">
                    Nacido: {formatDate(pet.birthDate)}
                  </Text>
                ) : null}
              </View>
            </Card>
          ))
        ) : (
          <Empty
            title="Aún no tienes mascotas"
            description="La gestión completa de mascotas llega en la Fase 3."
          />
        )}
      </Section>
    </ScrollView>
  );
}
