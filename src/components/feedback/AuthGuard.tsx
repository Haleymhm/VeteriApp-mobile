import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

interface GuardProps {
  children: React.ReactNode;
  privateZone: boolean;
}

/**
 * AuthGuard decide si el árbol de rutas debería renderizarse.
 *
 * - Si el status aún no se ha resuelto (idle/loading), renderizamos children
 *   para que Expo Router pueda montar su árbol y mostrar la ruta actual. El
 *   redirect desde `app/index.tsx` se encarga del resto.
 * - Cuando privateZone === true (tab privado) y no hay sesión, redirige al
 *   login.
 * - Cuando privateZone === false (zona pública) y hay sesión, redirige a tabs.
 */
export function AuthGuard({ children, privateZone }: GuardProps) {
  const status = useAuthStore((s) => s.status);

  if (status === 'idle' || status === 'loading') {
    return <>{children}</>;
  }

  if (privateZone && status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  if (!privateZone && status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
