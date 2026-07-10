import { Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/cn';

export interface PillProps {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Pill({
  label,
  selected = false,
  color,
  onPress,
  size = 'md',
  disabled,
}: PillProps) {
  const isInteractive = !!onPress && !disabled;
  const Container = isInteractive ? Pressable : View;
  return (
    <Container
      {...(isInteractive
        ? {
            accessibilityRole: 'button',
            accessibilityState: { selected, disabled: !!disabled },
            onPress,
          }
        : {})}
      className={cn(
        'flex-row items-center justify-center rounded-full border',
        size === 'sm' ? 'h-8 px-3' : 'h-10 px-4',
        selected
          ? 'bg-primary/10 border-primary'
          : 'bg-white border-gray-300',
        disabled ? 'opacity-50' : '',
      )}
      style={
        selected && color
          ? { borderColor: color, backgroundColor: `${color}1A` }
          : undefined
      }
    >
      {selected && color ? (
        <View
          className="mr-1.5 h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      <Text
        className={cn(
          'font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm',
          selected ? 'text-primary' : 'text-gray-700',
        )}
        style={selected && color ? { color } : undefined}
      >
        {label}
      </Text>
    </Container>
  );
}
