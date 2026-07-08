import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

export interface BadgeProps {
  label: string;
  bgClass?: string;
  textClass?: string;
  className?: string;
}

export function Badge({
  label,
  bgClass = 'bg-gray-200',
  textClass = 'text-gray-700',
  className,
}: BadgeProps) {
  return (
    <View
      className={cn(
        'self-start rounded-full px-2.5 py-0.5',
        bgClass,
        className,
      )}
    >
      <Text className={cn('text-xs font-semibold', textClass)}>{label}</Text>
    </View>
  );
}
