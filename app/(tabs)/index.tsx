import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-primary">VeteriApp</Text>
      <Text className="mt-3 text-base text-gray-700">
        Estás autenticado. Esta pantalla es un placeholder.
      </Text>
      <Text className="mt-1 text-sm text-gray-500">
        (La Fase 2 traerá aquí tus próximas citas)
      </Text>
    </View>
  );
}
