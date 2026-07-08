import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-lg' },
  xl: { container: 'h-20 w-20', text: 'text-2xl' },
};

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: Size;
  className?: string;
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  className,
}: AvatarProps) {
  const sz = sizeStyles[size];
  return (
    <View
      className={cn(
        'overflow-hidden rounded-full bg-primary-100 items-center justify-center',
        sz.container,
        className,
      )}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : (
        <Text className={cn('font-bold text-primary-700', sz.text)}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}
