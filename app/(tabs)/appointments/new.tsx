import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { usePets } from '@/hooks/usePets';
import { useCategories } from '@/hooks/usePublicSettings';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { Avatar } from '@/components/ui/Avatar';
import { Loading, ErrorState } from '@/components/feedback/States';
import { useZodForm } from '@/lib/useZodForm';
import { newAppointmentSchema, type NewAppointmentFormValues } from '@/lib/newAppointment';

type Step = 'form' | 'pet' | 'category' | 'date' | 'time';

/* ──────────────────────────── sub-components ──────────────────────────── */

function PetOption({
  id, name, species, breed, selected, onPress,
}: {
  id: number; name: string; species: string;
  breed?: string | null; selected: boolean; onPress: (id: number) => void;
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
        <Text className="text-xs text-gray-500">{species}{breed ? ` · ${breed}` : ''}</Text>
      </View>
      {selected
        ? <View className="h-5 w-5 rounded-full bg-primary" />
        : <View className="h-5 w-5 rounded-full border-2 border-gray-300" />}
    </Pressable>
  );
}

function CategoryOption({
  id, name, color, selected, onPress,
}: {
  id: string; name: string; color: string;
  selected: boolean; onPress: (id: string) => void;
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
      <View className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="flex-1 text-base font-semibold text-gray-900">{name}</Text>
      {selected
        ? <View className="h-5 w-5 rounded-full bg-primary" />
        : <View className="h-5 w-5 rounded-full border-2 border-gray-300" />}
    </Pressable>
  );
}

/** Dropdown-style row selector */
function SelectorRow({
  label, value, placeholder, error, onPress, required = false,
}: {
  label: string; value: string | null; placeholder: string;
  error?: string; onPress: () => void; required?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-gray-700">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <Pressable
        onPress={onPress}
        className={`flex-row items-center justify-between rounded-xl border bg-white px-4 py-3.5 active:bg-gray-50 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <Text
          className={`flex-1 text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </Pressable>
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

/** Multiline text area */
function TextArea({
  label, value, onChange, placeholder, error, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; error?: string; required?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-gray-700">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View
        className={`border rounded-xl bg-white px-4 py-3 ${error ? 'border-red-400' : 'border-gray-300'}`}
        style={{ minHeight: 88 }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          style={{ flex: 1, fontSize: 14, color: '#111827', minHeight: 64 }}
        />
      </View>
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

function buildDayOptions(count = 14): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0) continue;
    const iso = d.toISOString().split('T')[0] as string;
    const label = d.toLocaleDateString('es-CL', { weekday: 'short', month: 'short', day: 'numeric' });
    days.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value: iso });
  }
  return days;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00',
];

/* ──────────────────────────── main screen ──────────────────────────── */

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
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pets = petsData?.data ?? [];

  const { errors, generalError, isSubmitting, setValue, handleSubmit } =
    useZodForm<NewAppointmentFormValues>(newAppointmentSchema, {
      petId: 0, categoryId: '', reason: '', date: '', notes: '',
    });

  useEffect(() => { if (selectedPetId) setValue('petId', selectedPetId); }, [selectedPetId, setValue]);
  useEffect(() => { if (selectedCategoryId) setValue('categoryId', selectedCategoryId); }, [selectedCategoryId, setValue]);
  useEffect(() => { setValue('reason', reason); }, [reason, setValue]);
  useEffect(() => { setValue('notes', notes); }, [notes, setValue]);
  useEffect(() => {
    if (selectedDate && selectedTime) setValue('date', `${selectedDate}T${selectedTime}:00.000Z`);
  }, [selectedDate, selectedTime, setValue]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
  const dayOptions = buildDayOptions(14);

  const dateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-CL', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  const canSubmit = Boolean(selectedPetId && selectedCategoryId && selectedDate && selectedTime && reason.trim());

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
      // generalError handled by useZodForm
    }
  }

  const submit = handleSubmit(onSubmit);

  /* ── loading / no pets ── */
  if (petsLoading || categoriesLoading) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <Loading label="Cargando..." />
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View className="flex-1 bg-white px-6 pt-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-2xl font-extrabold text-gray-900 mb-1">Agendar Cita</Text>
        <Text className="text-sm text-gray-500 mb-6">Solicita una nueva cita para tu mascota</Text>
        <ErrorState message="No tienes mascotas registradas. Regístralas desde la pestaña Mascotas." />
      </View>
    );
  }

  /* ── Pet picker ── */
  if (step === 'pet') {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-xl font-extrabold text-gray-900">Selecciona mascota</Text>
            <Text className="text-sm text-gray-500">Elige la mascota para esta cita</Text>
          </View>
          <Pressable onPress={() => setStep('form')} className="px-3 py-1.5">
            <Text className="text-sm font-bold text-primary">Cancelar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 32 }}>
          {pets.map((pet) => (
            <PetOption
              key={pet.id}
              id={pet.id}
              name={pet.name}
              species={pet.species}
              breed={pet.breed ?? null}
              selected={selectedPetId === pet.id}
              onPress={(id) => { setSelectedPetId(id); setStep('form'); }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  /* ── Category picker ── */
  if (step === 'category') {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-xl font-extrabold text-gray-900">Tipo de consulta</Text>
            <Text className="text-sm text-gray-500">¿Qué tipo de atención necesitas?</Text>
          </View>
          <Pressable onPress={() => setStep('form')} className="px-3 py-1.5">
            <Text className="text-sm font-bold text-primary">Cancelar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 32 }}>
          {categories?.map((cat) => (
            <CategoryOption
              key={cat.id}
              id={cat.id}
              name={cat.name}
              color={cat.color}
              selected={selectedCategoryId === cat.id}
              onPress={(id) => { setSelectedCategoryId(id); setStep('form'); }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  /* ── Date picker ── */
  if (step === 'date') {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-xl font-extrabold text-gray-900">Fecha de la cita</Text>
            <Text className="text-sm text-gray-500">Selecciona un día disponible</Text>
          </View>
          <Pressable onPress={() => setStep('form')} className="px-3 py-1.5">
            <Text className="text-sm font-bold text-primary">Cancelar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text className="text-xs text-gray-400 mb-1">Días hábiles · no domingos</Text>
          {dayOptions.map((opt) => (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              onPress={() => { setSelectedDate(opt.value); setStep('time'); }}
              className={`flex-row items-center justify-between rounded-xl border p-4 active:opacity-80 ${
                selectedDate === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-base font-medium text-gray-900">{opt.label}</Text>
              {selectedDate === opt.value && <View className="h-5 w-5 rounded-full bg-primary" />}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  /* ── Time picker ── */
  if (step === 'time') {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-xl font-extrabold text-gray-900">Hora de la cita</Text>
            <Text className="text-sm text-gray-500">{dateLabel ?? 'Selecciona una hora'}</Text>
          </View>
          <Pressable onPress={() => setStep('date')} className="px-3 py-1.5">
            <Text className="text-sm font-bold text-primary">Volver</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <View className="flex-row flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="button"
                onPress={() => { setSelectedTime(t); setStep('form'); }}
                className={`rounded-full border px-5 py-2.5 active:opacity-80 ${
                  selectedTime === t ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={`text-sm font-semibold ${selectedTime === t ? 'text-white' : 'text-gray-900'}`}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ── Main form ── */
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Page header */}
      <View className="px-6 pt-6 pb-5 flex-row items-start justify-between">
        <View className="flex-1 gap-1 pr-4">
          <Text className="text-2xl font-extrabold text-gray-900">Agendar Cita</Text>
          <Text className="text-sm text-gray-500">Solicita una nueva cita para tu mascota</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary rounded-xl px-4 py-2.5 active:bg-primary-700"
        >
          <Text className="text-sm font-bold text-white">Cancelar</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form card */}
        <View className="bg-white rounded-2xl border border-gray-200 p-5 gap-5">
          <Text className="text-base font-bold text-gray-900">Solicitar Nueva Cita</Text>

          {successMessage ? (
            <View className="rounded-xl border border-green-300 bg-green-50 p-4">
              <Text className="text-sm font-semibold text-green-700">{successMessage}</Text>
              <Text className="mt-1 text-xs text-green-600">
                Te redirigiremos al detalle de tu cita en un momento...
              </Text>
            </View>
          ) : null}

          {generalError ? (
            <View className="rounded-xl border border-red-300 bg-red-50 p-4">
              <Text className="text-sm text-red-600">{generalError}</Text>
            </View>
          ) : null}

          {/* Mascota */}
          <SelectorRow
            label="Mascota"
            required
            value={selectedPet?.name ?? null}
            placeholder="Selecciona una mascota"
            error={errors.petId as string | undefined}
            onPress={() => setStep('pet')}
          />

          {/* Fecha + Hora side by side */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SelectorRow
                label="Fecha"
                required
                value={dateLabel}
                placeholder="dd/mm/aaaa"
                onPress={() => setStep('date')}
              />
            </View>
            <View className="flex-1">
              <SelectorRow
                label="Hora"
                required
                value={selectedTime}
                placeholder="Selecciona hora"
                onPress={() => selectedDate ? setStep('time') : setStep('date')}
              />
            </View>
          </View>

          {/* Categoría */}
          <SelectorRow
            label="Categoría"
            required
            value={selectedCategory?.name ?? null}
            placeholder="Cirugía"
            error={errors.categoryId as string | undefined}
            onPress={() => setStep('category')}
          />

          {/* Motivo */}
          <TextArea
            label="Motivo de consulta"
            required
            value={reason}
            onChange={setReason}
            placeholder="Selecciona el motivo"
            error={errors.reason as string | undefined}
          />

          {/* Notas adicionales */}
          <TextArea
            label="Notas adicionales"
            value={notes}
            onChange={setNotes}
            placeholder="Describe los síntomas o cualquier información relevante..."
          />
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 mt-5">
          <Pressable
            onPress={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3.5 items-center active:bg-gray-50 disabled:opacity-50"
          >
            <Text className="text-sm font-bold text-gray-700">Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={submit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 rounded-xl bg-primary py-3.5 items-center active:bg-primary-700 disabled:opacity-40"
          >
            <Text className="text-sm font-bold text-white">
              {isSubmitting ? 'Enviando...' : 'Solicitar Cita'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}