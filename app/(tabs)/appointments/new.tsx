import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { usePets } from '@/hooks/usePets';
import { useCategories } from '@/hooks/usePublicSettings';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectRow } from '@/components/ui/SelectRow';
import { Avatar } from '@/components/ui/Avatar';
import { Loading, ErrorState } from '@/components/feedback/States';
import { useZodForm } from '@/lib/useZodForm';
import { newAppointmentSchema, type NewAppointmentFormValues } from '@/lib/newAppointment';

type Step = 'form' | 'pet' | 'category' | 'date' | 'time';

function PetOption({
  id,
  name,
  species,
  breed,
  selected,
  onPress,
}: {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  selected: boolean;
  onPress: (id: number) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(id)}
      className={`flex-row items-center gap-3 rounded-xl border p-4 active:opacity-80 ${
        selected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
      }`}
    >
      <Avatar name={name} size="md" />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{name}</Text>
        <Text className="text-xs text-gray-500">
          {species}
          {breed ? ` · ${breed}` : ''}
        </Text>
      </View>
      {selected ? (
        <View className="h-5 w-5 rounded-full bg-primary" />
      ) : (
        <View className="h-5 w-5 rounded-full border-2 border-gray-300" />
      )}
    </Pressable>
  );
}

function CategoryOption({
  id,
  name,
  color,
  selected,
  onPress,
}: {
  id: string;
  name: string;
  color: string;
  selected: boolean;
  onPress: (id: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(id)}
      className={`flex-row items-center gap-3 rounded-xl border p-4 active:opacity-80 ${
        selected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
      }`}
    >
      <View
        className="h-5 w-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="flex-1 text-base font-semibold text-gray-900">
        {name}
      </Text>
      {selected ? (
        <View className="h-5 w-5 rounded-full bg-primary" />
      ) : (
        <View className="h-5 w-5 rounded-full border-2 border-gray-300" />
      )}
    </Pressable>
  );
}

function buildDayOptions(count = 7): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0) continue;
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-CL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    days.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value: iso });
  }
  return days;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00',
];

export default function NewAppointmentScreen() {
  const router = useRouter();

  const { data: petsData, isLoading: petsLoading } = usePets();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createAppointment = useCreateAppointment();

  const [step, setStep] = useState<Step>('form');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pets = petsData?.data ?? [];

  const { values, errors, generalError, isSubmitting, setValue, handleSubmit } =
    useZodForm<NewAppointmentFormValues>(newAppointmentSchema, {
      petId: 0,
      categoryId: '',
      reason: '',
      date: '',
      notes: '',
    });

  useEffect(() => {
    if (selectedPetId) setValue('petId', selectedPetId);
  }, [selectedPetId, setValue]);

  useEffect(() => {
    if (selectedCategoryId) setValue('categoryId', selectedCategoryId);
  }, [selectedCategoryId, setValue]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const isoDate = `${selectedDate}T${selectedTime}:00.000Z`;
      setValue('date', isoDate);
    }
  }, [selectedDate, selectedTime, setValue]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  async function onSubmit(v: NewAppointmentFormValues) {
    try {
      const result = await createAppointment.mutateAsync({
        petId: v.petId,
        categoryId: v.categoryId,
        date: v.date,
        reason: v.reason.trim(),
        notes: v.notes?.trim() || undefined,
      });
      setSuccessMessage('Cita solicitada. Recibirás un email cuando sea confirmada.');
      setTimeout(() => {
        router.replace(`/(tabs)/appointments/${result.id}` as never);
      }, 1500);
    } catch {
      // generalError will be set by useZodForm
    }
  }

  const submit = handleSubmit(onSubmit);

  const dayOptions = buildDayOptions(7);

  if (petsLoading || categoriesLoading) {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6">
          <ScreenHeader title="Nueva cita" subtitle="Completa los datos" back={() => router.back()} />
        </View>
        <Loading label="Cargando..." />
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Nueva cita"
            subtitle="Primero necesitas registrar una mascota"
            back={() => router.back()}
          />
          <ErrorState message="No tienes mascotas registradas. Regístralas desde la pestaña Mascotas." />
        </View>
      </View>
    );
  }

  if (step === 'pet') {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6">
          <ScreenHeader
            title="Selecciona mascota"
            subtitle="Elige la mascota para esta cita"
            back={() => setStep('form')}
          />
        </View>
        <ScrollView contentContainerClassName="gap-3 px-6 pb-8">
          {pets.map((pet) => (
            <PetOption
              key={pet.id}
              id={pet.id}
              name={pet.name}
              species={pet.species}
              breed={pet.breed ?? null}
              selected={selectedPetId === pet.id}
              onPress={(id) => {
                setSelectedPetId(id);
                setStep('form');
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (step === 'category') {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6">
          <ScreenHeader
            title="Tipo de consulta"
            subtitle="¿Qué tipo de atención necesitas?"
            back={() => setStep('form')}
          />
        </View>
        <ScrollView contentContainerClassName="gap-3 px-6 pb-8">
          {categories?.map((cat) => (
            <CategoryOption
              key={cat.id}
              id={cat.id}
              name={cat.name}
              color={cat.color}
              selected={selectedCategoryId === cat.id}
              onPress={(id) => {
                setSelectedCategoryId(id);
                setStep('form');
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (step === 'date') {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6">
          <ScreenHeader
            title="Día de la cita"
            subtitle="Selecciona una fecha"
            back={() => setStep('form')}
          />
        </View>
        <ScrollView contentContainerClassName="gap-3 px-6 pb-8">
          <Text className="text-sm text-gray-500">
            Solo se muestran días hábiles. No selectable días domingo.
          </Text>
          {dayOptions.map((opt) => (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedDate === opt.value }}
              onPress={() => {
                setSelectedDate(opt.value);
                setStep('time');
              }}
              className={`flex-row items-center justify-between rounded-xl border p-4 active:opacity-80 ${
                selectedDate === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-base font-medium text-gray-900">
                {opt.label}
              </Text>
              {selectedDate === opt.value && (
                <View className="h-5 w-5 rounded-full bg-primary" />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (step === 'time') {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6">
          <ScreenHeader
            title="Hora de la cita"
            subtitle={`${selectedDate ?? 'Fecha'} — selecciona una hora`}
            back={() => setStep('date')}
          />
        </View>
        <ScrollView contentContainerClassName="gap-3 px-6 pb-8">
          <View className="flex-row flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTime === t }}
                onPress={() => {
                  setSelectedTime(t);
                  setStep('form');
                }}
                className={`rounded-full border px-4 py-2 active:opacity-80 ${
                  selectedTime === t
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedTime === t ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Nueva cita"
          subtitle="Completa los datos para solicitar tu hora"
          back={() => router.back()}
        />

        {successMessage ? (
          <View className="rounded-xl border border-success/30 bg-success/10 p-4">
            <Text className="text-base font-semibold text-success">
              {successMessage}
            </Text>
            <Text className="mt-1 text-sm text-success/80">
              Te redirigiremos al detalle de tu cita en un momento...
            </Text>
          </View>
        ) : null}

        {generalError ? (
          <View className="rounded-xl border border-danger/30 bg-danger/10 p-4">
            <Text className="text-sm text-danger">{generalError}</Text>
          </View>
        ) : null}

        <View className="gap-4">
          <SelectRow
            label="Mascota *"
            value={selectedPet?.name ?? null}
            placeholder="Selecciona una mascota"
            error={errors.petId as string | undefined}
            onPress={() => setStep('pet')}
            leftSlot={
              selectedPet ? (
                <Avatar name={selectedPet.name} size="sm" />
              ) : undefined
            }
          />

          <SelectRow
            label="Tipo de consulta *"
            value={selectedCategory?.name ?? null}
            placeholder="Selecciona el tipo de atención"
            error={errors.categoryId as string | undefined}
            onPress={() => setStep('category')}
            rightSlot={
              selectedCategory ? (
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
              ) : undefined
            }
          />

          <SelectRow
            label="Fecha y hora *"
            value={
              selectedDate && selectedTime
                ? `${selectedDate} ${selectedTime}`
                : null
            }
            placeholder="Selecciona fecha y hora"
            error={errors.date as string | undefined}
            onPress={() => setStep('date')}
          />

          <Input
            label="Motivo de la consulta *"
            placeholder="Ej: Vacunación, control anual..."
            value={values.reason ?? ''}
            onChangeText={(t) => setValue('reason', t)}
            error={errors.reason as string | undefined}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            containerClassName="h-24"
          />

          <Input
            label="Notas adicionales"
            placeholder="Información extra para el veterinario (opcional)"
            value={values.notes ?? ''}
            onChangeText={(t) => setValue('notes', t)}
            error={errors.notes as string | undefined}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            containerClassName="h-24"
          />
        </View>

        <View className="gap-3">
          <Button
            title="Solicitar cita"
            onPress={submit}
            loading={isSubmitting}
            disabled={
              !selectedPetId ||
              !selectedCategoryId ||
              !selectedDate ||
              !selectedTime
            }
          />
          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => router.back()}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}