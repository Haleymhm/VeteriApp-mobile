import { useCallback } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePets } from '@/hooks/usePets';
import { PetCard } from '@/components/lists/PetCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';

export default function PetsListScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = usePets();

  useFocusEffect(
    useCallback(() => {
      void refetch();
      return () => undefined;
    }, [refetch]),
  );

  const handleOpenPet = useCallback(
    (id: number) => router.push(`/(tabs)/pets/${id}` as never),
    [router],
  );

  const pets = data?.data ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 px-6">
        <ScreenHeader
          title="Mis mascotas"
          subtitle="Aquí verás todas tus mascotas registradas."
        />
        <Loading label="Cargando mascotas..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 px-6">
        <ScreenHeader
          title="Mis mascotas"
          subtitle="Aquí verás todas tus mascotas registradas."
        />
        <ErrorState message={getErrorMessage(error)} />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6">
      <ScreenHeader
        title="Mis mascotas"
        subtitle="Toca una mascota para ver su detalle."
      />
      <FlashList
        data={pets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PetCard
            id={item.id}
            name={item.name}
            species={item.species}
            breed={item.breed}
            birthDate={item.birthDate}
            weight={item.weight}
            onPress={handleOpenPet}
          />
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <Empty
            title="Aún no tienes mascotas"
            description="Contacta a la clínica para registrar tu primera mascota y empezar a agendar citas."
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListHeaderComponent={
          pets.length > 0 ? (
            <Text className="pb-2 text-xs text-gray-500">
              {pets.length === 1
                ? '1 mascota registrada'
                : `${pets.length} mascotas registradas`}
            </Text>
          ) : null
        }
      />
    </View>
  );
}
