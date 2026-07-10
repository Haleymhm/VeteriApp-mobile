import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { cn } from '@/lib/cn';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  back,
  trailing,
  className,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-3 pb-4 pt-4',
        className,
      )}
    >
      <View className="flex-1 flex-row items-center gap-3">
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={back}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronLeft size={24} color="#1F2937" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-sm text-gray-500" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {trailing}
    </View>
  );
}
