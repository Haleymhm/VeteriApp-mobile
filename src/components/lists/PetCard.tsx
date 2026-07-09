import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { ChevronRight } from 'lucide-react-native';
import { formatDate } from '@/lib/formatDate';

export interface PetCardProps {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  onPress?: (id: number) => void;
}

function PetCardBase({
  id,
  name,
  species,
  breed,
  birthDate,
  weight,
  onPress,
}: PetCardProps) {
  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);

  const subtitle = breed ? `${species} · ${breed}` : species;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${name}`}
      onPress={handlePress}
      className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <Avatar name={name} size="lg" />
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {subtitle}
        </Text>
        {birthDate || weight ? (
          <Text className="text-xs text-gray-400">
            {birthDate ? `Nacido: ${formatDate(birthDate)}` : ''}
            {birthDate && weight ? ' · ' : ''}
            {weight != null ? `${weight} kg` : ''}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export const PetCard = memo(PetCardBase);
