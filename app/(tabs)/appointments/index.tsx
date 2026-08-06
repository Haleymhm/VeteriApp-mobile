import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentRow } from '@/components/lists/AppointmentRow';
import { Stack } from 'expo-router';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { isFuture } from '@/lib/formatDate';
import { getErrorMessage } from '@/lib/errors';

type Tab = 'upcoming' | 'past';

export default function AppointmentsListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('upcoming');

  const { data, isLoading, error, refetch, isRefetching } = useAppointments();

  useFocusEffect(
    useCallback(() => {
      void refetch();
      return () => undefined;
    }, [refetch]),
  );

  const { upcoming, past } = useMemo(() => {
    const all = data ?? [];
    return {
      upcoming: all
        .filter((a) => isFuture(a.date))
        .sort((x, y) => x.date.localeCompare(y.date)),
      past: all
        .filter((a) => !isFuture(a.date))
        .sort((x, y) => y.date.localeCompare(x.date)),
    };
  }, [data]);

  const handleOpen = useCallback(
    (id: number) => router.push(`/(tabs)/appointments/${id}` as never),
    [router],
  );

  const handleNew = useCallback(
    () => router.push('/(tabs)/appointments/new'),
    [router],
  );

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pt-6 pb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1 pr-4">
            <Text className="text-2xl font-extrabold text-gray-900">Mis Citas</Text>
            <Text className="text-sm text-gray-500">
              Revisa el estado de tus citas agendadas
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agendar nueva cita"
            onPress={handleNew}
            className="flex-row items-center gap-1.5 bg-primary rounded-xl px-4 py-2.5 active:bg-primary-700"
          >
            <Plus size={16} color="white" />
            <Text className="text-sm font-bold text-white">Nueva Cita</Text>
          </Pressable>
        </View>

        {/* Tab selector */}
        <View className="flex-row mt-5 border-b border-gray-100">
          {([
            { value: 'upcoming' as Tab, label: 'Próximas Citas' },
            { value: 'past' as Tab, label: 'Historial' },
          ]).map((t) => {
            const active = tab === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setTab(t.value)}
                className={`pb-3 pt-1 mr-6 border-b-2 ${active ? 'border-primary' : 'border-transparent'}`}
              >
                <Text className={`text-sm font-bold ${active ? 'text-primary' : 'text-gray-500'}`}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <Loading label="Cargando citas..." />
      ) : error ? (
        <View className="px-6">
          <ErrorState message={getErrorMessage(error)} />
        </View>
      ) : list.length === 0 ? (
        <View className="px-6 pt-6">
          {tab === 'upcoming' ? (
            <Empty
              title="Sin citas próximas"
              description="Cuando agendes una cita aparecerá aquí."
            />
          ) : (
            <Empty
              title="Aún no hay historial"
              description="Las citas pasadas aparecerán aquí."
            />
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 96, paddingTop: 12, gap: 12, paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          <Text className="text-xs text-gray-400 pb-1 pl-2">
            {list.length === 1 ? '1 cita' : `${list.length} citas`}
          </Text>
          {list.map((a) => {
            const vet = a.vet
              ? `Dr. ${a.vet.firstName} ${a.vet.lastName}`.trim()
              : null;
            return (
              <AppointmentRow
                key={a.id}
                id={a.id}
                date={a.date}
                reason={a.reason}
                status={a.status}
                notes={a.notes ?? null}
                petName={a.pet?.name ?? 'Mascota'}
                categoryName={a.category?.name ?? null}
                vetName={vet}
                onPress={handleOpen}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
