# VeteriApp Mobile

App móvil nativa (iOS / Android) del **Portal del Cliente** de [VeteriApp](https://github.com/anomalyco/VeteriApp), construida con **React Native + Expo SDK 57**. Permite a los dueños de mascotas gestionar sus citas, ver el historial médico de sus mascotas y editar su perfil desde cualquier lugar.

> Repositorio único: `veteriApp-mobile` · Gestor de paquetes: **pnpm** · Estado: Fase 1 y Fase 2 ✅ completas (build verde en web/iOS/Android)

---

## Stack

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | React Native + Expo | SDK 57 |
| Lenguaje | TypeScript | 5.5 (strict) |
| Navegación | Expo Router (file-based) + Native Bottom Tabs (`expo-router/unstable-native-tabs`) | 57.x |
| Estilos | NativeWind (Tailwind CSS 3 para RN) | 4.x |
| Estado | Zustand | 5.x |
| Data Fetching | TanStack Query (React Query) | 5.x |
| HTTP Client | Axios (`withCredentials: true`) | 1.x |
| Validación | Zod | 4.x |
| Almacenamiento Seguro | `expo-secure-store` | 57.x |
| Notificaciones Push (pendiente) | `expo-notifications` | 57.x |
| Iconos nativos | SF Symbols (iOS) + Material Symbols (Android) | — |
| Listas virtualizadas | FlashList (`@shopify/flash-list`) | 2.x |
| Imágenes | `expo-image` | 57.x |
| Testing | Jest + React Native Testing Library | — |
| Builds en la nube | EAS Build | instalado vía `pnpm` |

> Requisito clave: NativeWind 4 exige **Tailwind CSS 3.4.x** (no 4.x).

---

## Requisitos

- **Node.js** ≥ 20.19 (recomendado LTS más reciente; SDK 57 también soporta 22.13.x)
- **pnpm** 9.x (este repo fija `pnpm@9.15.1` en `package.json`)
- Para builds iOS: macOS con Xcode 26.4+
- Para builds Android: Android SDK + Java 17 (Gradle 9)

> El proyecto usa **siempre `pnpm`**. No usar `npm install` ni `yarn add`.

---

## Scripts

```bash
pnpm install         # instalar dependencias
pnpm start           # arrancar Metro / Expo Dev Client
pnpm android         # Expo → Android (emulador/dispositivo)
pnpm ios             # Expo → iOS Simulator
pnpm web             # Expo → Web
pnpm build           # exporta bundle web/iOS/Android (sin EAS)
pnpm typecheck       # tsc --noEmit
pnpm lint            # ESLint (config expo)
pnpm test            # Jest
pnpm eas:build                    # eas build (interactivo)
pnpm eas:build:preview            # eas build con perfil "preview"
pnpm eas:build --profile prod    # eas build con perfil "production"
```

---

## Estructura del proyecto

```
veteriApp-mobile/
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root: QueryClient + SafeAreaProvider + AuthGuard + Stack
│   ├── +not-found.tsx                # 404 con redirección por sesión
│   ├── (auth)/                       # Stack de autenticación (login/register/forgot)
│   └── (tabs)/                       # Native bottom tabs (Inicio / Mascotas / Citas / Perfil)
│       ├── _layout.tsx               # NativeTabs de expo-router
│       ├── index.tsx                 # HomeScreen (dashboard con próximas citas)
│       ├── pets/                     # Pendiente de CRUD/detalle (Fase 3)
│       ├── appointments/             # Pendiente de new + detalle (Fase 3)
│       └── profile/                  # index / edit / change-password
│
├── src/
│   ├── api/                          # Cliente Axios y endpoints (auth, pets, appointments, profile, public)
│   ├── components/
│   │   ├── ui/                       # Button, Input, Card, Badge, Avatar, Section
│   │   ├── forms/                    # LoginForm, RegisterForm, ForgotPasswordForm
│   │   ├── feedback/                 # AuthGuard, Loading, Empty, ErrorState
│   │   └── lists/                    # AppointmentCard (más en Fase 3)
│   ├── hooks/                        # useAuth, useProfile, usePets, useAppointments, usePublicSettings…
│   ├── store/                        # authStore (Zustand)
│   ├── lib/                          # storage, validators (Zod), errors, queryClient, formatDate, useZodForm
│   └── types/                        # auth, inputs, pet, appointment, profile
│
├── assets/                           # Iconos por defecto (personalizar con branding)
├── babel.config.js                   # module-resolver (@/*) + babel-preset-expo + nativewind/babel
├── metro.config.js                   # withNativeWind({ input: './global.css' })
├── tailwind.config.js                # preset nativewind + paleta VeteriApp
├── global.css                        # directivas @tailwind
├── nativewind-env.d.ts               # tipos de NativeWind
├── eas.json                          # development / preview / production
├── eslint.config                     # extends: expo, ignorePatterns: dist/node_modules/.expo
├── app.json                          # userInterfaceStyle: automatic, web.bundler: metro
└── tsconfig.json                     # extends expo/tsconfig.base + paths @/*
```

---

## Alias `@/*`

Configurado en:
- `tsconfig.json` → `compilerOptions.paths: { "@/*": ["src/*"] }`
- `babel.config.js` → `plugins: ["module-resolver", { alias: { "@": "./src" } }]`

Permite escribir:
```ts
import { useAuth } from '@/hooks/useAuth';
```

---

## Autenticación

Aunque la API usa **JWT en cookies HttpOnly** (no `Authorization: Bearer`), el cliente Axios está preparado para ambos:

- `withCredentials: true` en `apiClient` para enviar/recibir cookies.
- Interceptor de request que añade `Authorization: Bearer <token>` si hay token persistido en SecureStore (caminos futuros del backend).
- `authStore.hydrate()` verifica la sesión con `GET /api/v1/auth/session` (aprovecha la cookie) antes de confiar en tokens locales.

> **Variable de entorno:** `EXPO_PUBLIC_API_URL` (default: `http://localhost:3000/api/v1`).

---

## Fases / Roadmap

| Fase | Descripción | Estado |
|------|-------------|--------|
| **0** | Configuración base (Expo 57, NativeWind 4, Tailwind 3, ESLint, Metro, EAS, alias `@/*`) | ✅ |
| **1** | Proyecto base y autenticación (login, register, forgot, API client, storage, authStore, AuthGuard) | ✅ |
| **2** | Navegación y Dashboard (NativeTabs, HomeScreen, Profile, Edit, ChangePassword, hooks Query) | ✅ |
| **3** | Mascotas y Citas (CRUD pets, nueva cita, detalle cita, listado paginado) | ⏳ |
| **4** | Historial Médico (vacunas, desparasitación, condiciones crónicas) | ⏳ |
| **5** | Notificaciones Push (expo-notifications, permisos, templates) | ⏳ |

Ver detalles en [`PLAN_MOBILE.md`](./PLAN_MOBILE.md).

---

## Configuración

### `EXPO_PUBLIC_API_URL`
URL del backend. Se inyecta al bundle en build time (Expo resuelve `process.env.EXPO_PUBLIC_*`).

```bash
# .env (no commitear si contiene secretos)
EXPO_PUBLIC_API_URL=https://api.veteriapp.cl/api/v1
```

### EAS Build

```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":      { "distribution": "internal" },
    "production":   {}
  }
}
```

```bash
pnpm eas:build --profile preview
```

---

## Calidad

```bash
pnpm typecheck   # tsc --noEmit   ✅ 0 errores
pnpm lint        # eslint .       ✅ 0 errores
pnpm build       # expo export    ✅ genera web/iOS/Android
```

---

## Decisiones técnicas relevantes

1. **`NativeTabs` estable + nativo**: en SDK 57 usamos `expo-router/unstable-native-tabs` con SF Symbols iOS y Material Android — sin paquete de iconos extra.
2. **NativeWind 4 + Tailwind 3** (no Tailwind 4): `react-native-css-interop` se declara como dependencia directa (era transitiva y Metro no resolvía `jsx-runtime`).
3. **Alias `@/*`**: `babel-plugin-module-resolver` enlazado a tsconfig paths para un runtime coherente.
4. **`useZodForm`** ligero (sin React-Hook-Form): controla `ValidationError`→`errors` y serializa llamadas al handler con `setIsSubmitting`/`generalError`.
5. **API en cookies HttpOnly**: `withCredentials: true` + verificación de sesión vía `GET /auth/session`.
6. **Sin `Effector`/Redux**: Zustand para estado local + TanStack Query para estado del servidor.

---

## Recursos

- [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router — Native Tabs](https://docs.expo.dev/versions/v57.0.0/sdk/router/native-tabs.md)
- [NativeWind v4 setup](https://www.nativewind.dev/docs/getting-started/installation)
- [`PLAN_MOBILE.md`](./PLAN_MOBILE.md) — plan maestro completo
- [`PORTAL_CLIENT_API.md`](./PORTAL_CLIENT_API.md) — especificación de la API REST

---

## Licencia

Privado. Todos los derechos reservados.
