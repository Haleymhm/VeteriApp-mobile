import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native';

interface LoadingProps {
  label?: string;
}

export function Loading({ label = 'Cargando...' }: LoadingProps) {
  return (
    <View className="items-center justify-center gap-3 p-6">
      <ActivityIndicator color="#3B82F6" size="large" />
      <Text className="text-sm text-gray-500">{label}</Text>
    </View>
  );
}

interface EmptyProps {
  title: string;
  description?: string;
}

export function Empty({ title, description }: EmptyProps) {
  return (
    <View className="items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8">
      <Text className="text-base font-semibold text-gray-700">{title}</Text>
      {description ? (
        <Text className="text-center text-sm text-gray-500">{description}</Text>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <View className="items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 p-6">
      <Text className="text-base font-semibold text-danger">Algo salió mal</Text>
      <Text className="text-center text-sm text-danger/80">{message}</Text>
    </View>
  );
}
