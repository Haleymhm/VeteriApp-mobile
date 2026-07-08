import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Section({
  title,
  subtitle,
  trailing,
  className,
  children,
}: SectionProps) {
  return (
    <View className={cn('w-full gap-3', className)}>
      {(title || subtitle || trailing) && (
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-0.5">
            {title ? (
              <Text className="text-base font-semibold text-gray-900">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="text-xs text-gray-500">{subtitle}</Text>
            ) : null}
          </View>
          {trailing}
        </View>
      )}
      <View className="gap-3">{children}</View>
    </View>
  );
}
