import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: ViewProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
