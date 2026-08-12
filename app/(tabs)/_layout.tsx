import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Home, PawPrint, Calendar, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

function TopHeaderTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const tabItems = [
    { key: 'index', label: 'Inicio', path: '/(tabs)', Icon: Home },
    { key: 'pets', label: 'Mascotas', path: '/(tabs)/pets', Icon: PawPrint },
    { key: 'appointments', label: 'Citas', path: '/(tabs)/appointments', Icon: Calendar },
    { key: 'profile', label: 'Perfil', path: '/(tabs)/profile', Icon: User },
  ];

  const getActiveKey = () => {
    if (pathname.includes('/pets')) return 'pets';
    if (pathname.includes('/appointments')) return 'appointments';
    if (pathname.includes('/profile')) return 'profile';
    return 'index';
  };

  const activeKey = getActiveKey();

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 12) }}
      className="bg-white border-b border-gray-200 shadow-sm z-50"
    >
      {/* App Header Row */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 34, height: 34 }}
            contentFit="contain"
          />
          <Text className="text-xl font-bold text-gray-900 tracking-tight">
            VeteriApp
          </Text>
        </View>

        {user ? (
          <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <View className="w-6 h-6 rounded-full bg-brand-500 items-center justify-center">
              <Text className="text-xs font-bold text-white">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text className="text-xs font-semibold text-gray-700">
              {user.firstName}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Top Header Navigation Tabs */}
      <View className="flex-row border-t border-gray-100">
        {tabItems.map((item) => {
          const isFocused = activeKey === item.key;
          const Icon = item.Icon;

          return (
            <Pressable
              key={item.key}
              onPress={() => {
                if (!isFocused) {
                  router.push(item.path as any);
                }
              }}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3 border-b-2 ${
                isFocused ? 'border-brand-500 bg-brand-25/50' : 'border-transparent'
              }`}
            >
              <Icon
                size={18}
                color={isFocused ? '#465fff' : '#667085'}
                strokeWidth={isFocused ? 2.2 : 1.8}
              />
              <Text
                className={`text-xs ${
                  isFocused ? 'text-brand-600 font-bold' : 'text-gray-600 font-medium'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-white">
      <TopHeaderTabBar />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
          <Tabs.Screen name="pets" options={{ title: 'Mascotas' }} />
          <Tabs.Screen name="appointments" options={{ title: 'Citas' }} />
          <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
        </Tabs>
      </View>
    </View>
  );
}
