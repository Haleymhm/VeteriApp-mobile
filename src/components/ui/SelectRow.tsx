import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/cn';

export interface SelectRowProps {
  label: string;
  value?: string | null;
  placeholder?: string;
  error?: string;
  hint?: string;
  onPress?: () => void;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  chevron?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectRow({
  label,
  value,
  placeholder,
  error,
  hint,
  onPress,
  leftSlot,
  rightSlot,
  chevron = true,
  disabled,
  className,
}: SelectRowProps) {
  const interactive = !!onPress && !disabled;
  const Container = interactive ? Pressable : View;
  const containerProps = interactive
    ? {
        accessibilityRole: 'button' as const,
        accessibilityState: { disabled: !!disabled },
        accessibilityValue: value ? { text: value } : undefined,
        onPress,
      }
    : {};
  return (
    <View className={cn('w-full gap-1', className)}>
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <Container
        {...containerProps}
        className={cn(
          'flex-row items-center gap-3 rounded-xl border bg-white px-4',
          'min-h-[48px]',
          error ? 'border-danger' : 'border-gray-300',
          disabled ? 'opacity-60' : '',
        )}
      >
        {leftSlot}
        <Text
          className={cn(
            'flex-1 text-base',
            value ? 'text-gray-900' : 'text-gray-400',
          )}
          numberOfLines={1}
        >
          {value ?? placeholder ?? 'Seleccionar'}
        </Text>
        {rightSlot}
        {chevron && interactive ? (
          <ChevronRight size={18} color="#9CA3AF" />
        ) : null}
      </Container>
      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-gray-500">{hint}</Text>
      ) : null}
    </View>
  );
}
