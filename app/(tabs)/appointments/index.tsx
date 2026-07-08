import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentCard } from '@/components/lists/AppointmentCard';
import { Section } from '@/components/ui/Section';
import { Loading, ErrorState, Empty } from '@/components/feedback/States';
import { getErrorMessage } from '@/lib/errors';
import { isFuture } from '@/lib/formatDate';

export default function AppointmentsTabScreen() {
  const { data, isLoading, error } = useAppointments();
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

  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-12 pt-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-gray-900">Mis citas</Text>
        <Text className="text-sm text-gray-500">
          Revisa tus próximas citas y el historial. (La gestión completa llega
          en la Fase 3.)
        </Text>
      </View>

      <Section title="Próximas">
        {isLoading ? (
          <Loading label="Cargando citas..." />
        ) : error ? (
          <ErrorState message={getErrorMessage(error)} />
        ) : upcoming.length > 0 ? (
          upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        ) : (
          <Empty
            title="Sin citas próximas"
            description="Cuando agendes aparecerán en este listado."
          />
        )}
      </Section>

      <Section title="Historial">
        {past.length > 0 ? (
          past.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        ) : (
          <Empty
            title="Aún no hay historial"
            description="Las citas pasadas aparecerán aquí."
          />
        )}
      </Section>
    </ScrollView>
  );
}
