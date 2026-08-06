import { forwardRef, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { cn } from '@/lib/cn';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, required, containerClassName, className, secureTextEntry, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry !== undefined;

  return (
    <View className={cn('w-full', containerClassName)}>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required ? <Text className="text-error-500"> *</Text> : null}
        </Text>
      ) : null}
      <View className="relative w-full justify-center">
        <TextInput
          ref={ref}
          placeholderTextColor="#98a2b3"
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            'h-12 rounded-lg border bg-white px-4 text-base text-gray-900 shadow-theme-xs',
            isPassword ? 'pr-12' : '',
            error
              ? 'border-error-500'
              : focused
                ? 'border-brand-300'
                : 'border-gray-300',
            props.editable === false ? 'bg-gray-50 text-gray-500' : '',
            className,
          )}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 h-full items-center justify-center"
            hitSlop={10}
          >
            {showPassword ? (
              <EyeOff size={20} color="#98a2b3" />
            ) : (
              <Eye size={20} color="#98a2b3" />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1.5 text-xs text-error-500">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-gray-500">{hint}</Text>
      ) : null}
    </View>
  );
});
