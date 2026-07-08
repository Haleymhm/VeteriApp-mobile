import { forwardRef } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { cn } from '@/lib/cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, containerClassName, className, ...props },
  ref,
) {
  return (
    <View className={cn('w-full', containerClassName)}>
      {label ? (
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9CA3AF"
        className={cn(
          'h-12 rounded-xl border bg-white px-4 text-base text-gray-900',
          error ? 'border-danger' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-gray-500">{hint}</Text>
      ) : null}
    </View>
  );
});
