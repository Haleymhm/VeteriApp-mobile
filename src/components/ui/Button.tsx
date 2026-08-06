import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

type PressEvent = Parameters<NonNullable<PressableProps['onPress']>>[0];

export interface ButtonProps extends Omit<PressableProps, 'children' | 'onPress'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onPress?: (event: PressEvent) => void | Promise<void>;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-brand-500 active:bg-brand-600 shadow-theme-xs',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-gray-100 active:bg-gray-200 border border-gray-200',
    text: 'text-gray-700',
  },
  outline: {
    container: 'bg-white active:bg-gray-50 border border-gray-300 shadow-theme-xs',
    text: 'text-gray-700',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-brand-500',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-9 px-4', text: 'text-sm' },
  md: { container: 'h-11 px-5', text: 'text-base' },
  lg: { container: 'h-14 px-6', text: 'text-lg' },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  className,
  ...rest
}: ButtonProps) {
  const styles = variantStyles[variant];
  const sz = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress as PressableProps['onPress']}
      className={cn(
        'flex-row items-center justify-center rounded-lg',
        sz.container,
        styles.container,
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-60' : '',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#465fff'} />
      ) : (
        <Text className={cn('font-semibold', sz.text, styles.text)}>{title}</Text>
      )}
    </Pressable>
  );
}
