import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { calculateAge } from '@/lib/formatDate';
import { cn } from '@/lib/cn';

export interface PetCardProps {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  isActive?: boolean;
  onPress?: (id: number) => void;
}

function PetCardBase({
  id,
  name,
  species,
  breed,
  birthDate,
  weight,
  isActive = false,
  onPress,
}: PetCardProps) {
  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);

  const normSpecies = species.toLowerCase();
  const isDog = normSpecies === 'perro' || normSpecies === 'dog';
  const isCat = normSpecies === 'gato' || normSpecies === 'cat';

  const badgeBg = isDog
    ? 'bg-brand-100'
    : isCat
      ? 'bg-purple-100'
      : 'bg-gray-100';

  const badgeText = isDog
    ? 'text-brand-700'
    : isCat
      ? 'text-purple-700'
      : 'text-gray-700';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${name}`}
      onPress={handlePress}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-90',
        isActive
          ? 'border-brand-200 bg-brand-50/50'
          : 'border-gray-200 bg-white',
      )}
    >
      <Avatar name={name} size="lg" />
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center gap-2">
          <Badge
            label={species}
            bgClass={badgeBg}
            textClass={badgeText}
          />
          {breed ? (
            <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>
              {breed.toUpperCase()}
            </Text>
          ) : null}
        </View>
        {birthDate ? (
          <Text className="text-xs text-gray-400">
            {calculateAge(birthDate)}
          </Text>
        ) : null}
      </View>
      {isActive ? (
        <View className="mr-2 h-2.5 w-2.5 rounded-full bg-brand-500" />
      ) : null}
    </Pressable>
  );
}

export const PetCard = memo(PetCardBase);
