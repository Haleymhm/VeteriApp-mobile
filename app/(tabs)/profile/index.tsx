import { ScrollView, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Loading, ErrorState } from '@/components/feedback/States';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getErrorMessage } from '@/lib/errors';
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  ChevronRight,
  Lock,
  LogOut,
  Edit3,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Cargando...';

  const { data: profile, isLoading, error, refetch } = useProfile();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 48 }}
      className="flex-1 bg-gray-50"
    >
      {/* Hero avatar section */}
      <View className="bg-white px-6 pt-8 pb-6 items-center gap-3 border-b border-gray-100">
        <View className="rounded-full bg-primary/10 p-1">
          <Avatar name={displayName} size="xl" />
        </View>
        <View className="items-center gap-1">
          <Text className="text-xl font-extrabold text-gray-900">{displayName}</Text>
          {user?.email ? (
            <Text className="text-sm text-gray-500">{user.email}</Text>
          ) : null}
        </View>
        <Link href="/(tabs)/profile/edit" asChild>
          <Pressable className="flex-row items-center gap-1.5 bg-primary/10 rounded-full px-4 py-1.5 mt-1 active:bg-primary/20">
            <Edit3 size={13} color="#465fff" />
            <Text className="text-xs font-bold text-primary">Editar perfil</Text>
          </Pressable>
        </Link>
      </View>

      {/* Personal data section */}
      <View className="px-4 pt-5 gap-2">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
          Datos personales
        </Text>

        {isLoading ? (
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            <Loading label="Cargando datos..." />
          </View>
        ) : error ? (
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            <ErrorState message={getErrorMessage(error)} />
            <Pressable
              onPress={() => void refetch()}
              className="mt-3 self-start bg-primary/10 px-4 py-2 rounded-xl"
            >
              <Text className="text-sm font-bold text-primary">Reintentar</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <InfoRow icon={<User size={16} color="#6B7280" />} label="Email" value={profile.email} />
            <InfoRow icon={<Phone size={16} color="#6B7280" />} label="Teléfono" value={profile.phone} divider />
            <InfoRow icon={<MapPin size={16} color="#6B7280" />} label="Dirección" value={profile.address} divider />
            <InfoRow icon={<CreditCard size={16} color="#6B7280" />} label="RUT" value={profile.rut} divider />
            <InfoRow
              icon={<Globe size={16} color="#6B7280" />}
              label="Comuna"
              value={profile.comuna?.name}
              fallback={profile.region?.name ? `${profile.region.name} · —` : '—'}
              divider
            />
            <InfoRow
              icon={<Globe size={16} color="#6B7280" />}
              label="Región"
              value={profile.region?.name}
              divider
            />
          </View>
        ) : null}
      </View>

      {/* Actions section */}
      <View className="px-4 pt-5 gap-2">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
          Cuenta
        </Text>
        <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <Link href="/(tabs)/profile/edit" asChild>
            <Pressable className="flex-row items-center gap-3 px-4 py-4 active:bg-gray-50">
              <View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center">
                <Edit3 size={16} color="#465fff" />
              </View>
              <Text className="flex-1 text-sm font-semibold text-gray-900">Editar mis datos</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </Pressable>
          </Link>

          <View className="border-t border-gray-100">
            <Link href="/(tabs)/profile/change-password" asChild>
              <Pressable className="flex-row items-center gap-3 px-4 py-4 active:bg-gray-50">
                <View className="h-9 w-9 rounded-full bg-yellow-50 items-center justify-center">
                  <Lock size={16} color="#D97706" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-900">Cambiar contraseña</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </Pressable>
            </Link>
          </View>

          <View className="border-t border-gray-100">
            <Pressable
              onPress={() => void logout()}
              className="flex-row items-center gap-3 px-4 py-4 active:bg-red-50"
            >
              <View className="h-9 w-9 rounded-full bg-red-50 items-center justify-center">
                <LogOut size={16} color="#EF4444" />
              </View>
              <Text className="flex-1 text-sm font-semibold text-red-500">Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ── Info row ── */
function InfoRow({
  icon,
  label,
  value,
  fallback = '—',
  divider = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
  fallback?: string;
  divider?: boolean;
}) {
  return (
    <View className={`flex-row items-center gap-3 px-4 py-3.5 ${divider ? 'border-t border-gray-100' : ''}`}>
      <View className="w-5 items-center">{icon}</View>
      <Text className="text-sm text-gray-500 w-20">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-gray-900" numberOfLines={1}>
        {value?.trim() || fallback}
      </Text>
    </View>
  );
}
