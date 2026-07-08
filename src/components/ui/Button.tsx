import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-gray-100 active:bg-gray-200 border border-gray-300',
    text: 'text-gray-900',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-primary',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-9 px-3', text: 'text-sm' },
  md: { container: 'h-11 px-4', text: 'text-base' },
  lg: { container: 'h-14 px-6', text: 'text-lg' },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled,
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
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        sz.container,
        styles.container,
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-60' : '',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#1D4ED8'} />
      ) : (
        <Text className={cn('font-semibold', sz.text, styles.text)}>{title}</Text>
      )}
    </Pressable>
  );
}
