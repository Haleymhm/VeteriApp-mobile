import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentRow } from '@/components/lists/AppointmentRow';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { isFuture } from '@/lib/formatDate';
import { getErrorMessage } from '@/lib/errors';

type Tab = 'upcoming' | 'past';

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Historial' },
];

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
    <View className="flex-1 px-6">
      <ScreenHeader
        title="Mis citas"
        subtitle="Revisa tus próximas citas y el historial."
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agendar nueva cita"
            onPress={handleNew}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:bg-primary-700"
          >
            <Plus size={20} color="white" />
          </Pressable>
        }
      />

      <View className="pb-3">
        <SegmentedControl options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </View>

      {isLoading ? (
        <Loading label="Cargando citas..." />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} />
      ) : list.length === 0 ? (
        <View className="pt-6">
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
          contentContainerStyle={{ paddingBottom: 96, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          <Text className="pb-1 text-xs text-gray-500">
            {list.length === 1
              ? '1 cita'
              : `${list.length} citas`}
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
