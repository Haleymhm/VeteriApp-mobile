# VeteriApp Mobile

App móvil nativa (iOS / Android) del **Portal del Cliente** de [VeteriApp](https://github.com/haleymhm/Gestion-citas), construida con **React Native + Expo SDK 57**. Permite a los dueños de mascotas gestionar sus citas, consultar el historial médico de sus mascotas y editar su perfil desde cualquier lugar.

> Repositorio único: `veteriApp-mobile` · Gestor de paquetes: **pnpm** · Estado: Fases 0–4 ✅ completas (build y lint/typecheck verdes) · Fase 5 (Push) ⏳ pendiente

---

## Stack

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | React Native + Expo | ~57.0.4 (SDK 57) |
| Lenguaje | TypeScript (strict) | ~5.5.4 |
| React | React / React DOM | 19.2.3 |
| Navegación | Expo Router (file-based) + Native Bottom Tabs (`expo-router/unstable-native-tabs`) | ^57.0.4 |
| Estilos | NativeWind (Tailwind CSS 3 para RN) | ^4.2.6 |
| Tailwind | Tailwind CSS | ^3.4.17 |
| Estado local | Zustand | ^5.0.14 |
| Data Fetching | TanStack Query (React Query) | ^5.101.2 |
| HTTP Client | Axios (`withCredentials: true`) | ^1.18.1 |
| Validación | Zod | ^4.4.3 |
| Fechas | date-fns (locale `es`) | ^4.4.0 |
| Iconos | `lucide-react-native` + SF Symbols (iOS) / Material Symbols (Android) | ^1.23.0 |
| Almacenamiento Seguro | `expo-secure-store` | ^57.0.0 |
| Imágenes | `expo-image` | ^57.0.0 |
| Listas virtualizadas | FlashList (`@shopify/flash-list`) | ^2.3.2 |
| Animaciones | `react-native-reanimated` | ^4.5.1 |
| SVG | `react-native-svg` | ^15.15.5 |
| Safe Area | `react-native-safe-area-context` | ^5.8.0 |
| Web | `react-native-web` | ~0.21.2 |
| Notificaciones Push (pendiente) | `expo-notifications` | ^57.0.3 |
| Testing (infestructura) | Jest + React Native Testing Library | ^29.7.0 / ^13.3.3 |
| Builds en la nube | EAS Build | CLI ≥ 16.0.0 |

> Requisito clave: NativeWind 4 exige **Tailwind CSS 3.4.x** (no 4.x). `react-native-css-interop` se declara como dependencia directa (era transitiva y Metro no resolvía `jsx-runtime`).

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
pnpm install              # instalar dependencias
pnpm start                # arrancar Metro / Expo Dev Client
pnpm android              # Expo → Android (emulador/dispositivo)
pnpm ios                  # Expo → iOS Simulator
pnpm web                  # Expo → Web
pnpm build                # expo export (bundle web/iOS/Android, sin EAS)
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint .
pnpm test                 # jest (deps instaladas; sin config ni tests todavía)
pnpm eas:build            # eas build (interactivo)
pnpm eas:build:preview    # eas build --profile preview
pnpm eas:build:prod       # eas build --profile production
```

> ⚠️ **Testing:** están instaladas las dependencias de Jest + RNTL pero todavía **no existe `jest.config.*` ni archivos de test**. `pnpm test` fallará hasta añadir la configuración.

---

## Estructura del proyecto

```
veteriApp-mobile/
├── app/                                 # Expo Router (file-based)
│   ├── _layout.tsx                       # Root: QueryClient + SafeAreaProvider + StatusBar + AuthGuard + Stack
│   ├── +not-found.tsx                    # 404 con redirección según sesión
│   ├── (auth)/                           # Stack de autenticación
│   │   ├── _layout.tsx                   # SafeArea + KeyboardAvoidingView + Stack
│   │   ├── login.tsx                     # LoginForm + enlaces a register/forgot
│   │   ├── register.tsx                  # RegisterForm
│   │   └── forgot-password.tsx           # ForgotPasswordForm
│   ├── (tabs)/                           # Native bottom tabs
│   │   ├── _layout.tsx                   # NativeTabs: Inicio / Mascotas / Citas / Perfil
│   │   ├── index.tsx                     # HomeScreen (saludo + CTA + próximas 3 citas)
│   │   ├── pets/
│   │   │   ├── _layout.tsx               # Stack (headerShown: false)
│   │   │   ├── index.tsx                 # Listado con FlashList + pull-to-refresh
│   │   │   └── [id].tsx                  # Detalle de mascota + enlace a historial médico
│   │   ├── appointments/
│   │   │   ├── _layout.tsx              # Stack (headerShown: false)
│   │   │   ├── index.tsx                 # SegmentedControl Próximas/Historial + FAB
│   │   │   ├── new.tsx                   # Nueva cita paso a paso (pet → categoría → fecha → hora)
│   │   │   └── [id].tsx                  # Detalle de cita + cancelación inline
│   │   └── profile/
│   │       ├── index.tsx                 # Perfil (avatar, datos, acciones)
│   │       ├── edit.tsx                  # Editar datos personales
│   │       └── change-password.tsx       # Cambiar contraseña
│   └── medical-records/[petId]/          # Historial médico por mascota
│       ├── _layout.tsx                   # Stack (headerShown: false)
│       ├── index.tsx                     # Índice + lista de registros médicos
│       ├── vaccinations.tsx              # Vacunas (badges Vencida/Próxima)
│       ├── deworming.tsx                 # Desparasitación (tipo + próxima dosis)
│       └── chronic-conditions.tsx        # Condiciones crónicas (activas/resueltas + severidad)
│
├── src/
│   ├── api/                              # Cliente Axios y endpoints
│   │   ├── client.ts                     # apiClient (withCredentials, interceptores)
│   │   ├── auth.ts                       # login, logout, getSession, register, forgot, reset
│   │   ├── profile.ts                    # getProfile, updateProfile, changePassword
│   │   ├── pets.ts                       # list, get, create, update
│   │   ├── appointments.ts               # list (filtros), create, update
│   │   ├── medicalRecords.ts             # records, vaccinations, deworming, chronicConditions
│   │   ├── public.ts                     # getPublicSettings, getCategories
│   │   └── index.ts                      # Barrel re-export
│   ├── components/
│   │   ├── ui/                           # Button, Input, Card, Badge, Avatar, Section,
│   │   │                                 # ScreenHeader, Pill, SegmentedControl, SelectRow
│   │   ├── forms/                        # LoginForm, RegisterForm, ForgotPasswordForm
│   │   ├── feedback/                     # AuthGuard, Loading, Empty, ErrorState
│   │   └── lists/                        # AppointmentCard, AppointmentRow, PetCard
│   ├── hooks/                            # useAuth, useAuthStore, useProfile, usePets,
│   │                                     # useAppointments, useMedicalRecords, usePublicSettings
│   ├── store/
│   │   └── authStore.ts                  # Zustand: user, token, status, error + actions
│   ├── lib/
│   │   ├── storage.ts, storageKeys.ts    # wrapper expo-secure-store
│   │   ├── validators.ts                 # Zod: login, register, forgot, reset
│   │   ├── useZodForm.ts                 # hook form ligero (sin RHF)
│   │   ├── newPet.ts, newAppointment.ts  # Zod de mascotas y citas
│   │   ├── editProfile.ts, changePassword.ts  # Zod de perfil
│   │   ├── rut.ts                        # Zod RUT chileno (optativo)
│   │   ├── errors.ts                     # ApiRequestError, unwrap, getErrorMessage
│   │   ├── queryClient.ts                # QueryClient (retry 1, staleTime 60s)
│   │   ├── formatDate.ts                 # date-fns + es (formatDate, formatDateTime, STATUS_MAP)
│   │   └── cn.ts                         # utils de clases (sin clsx/tailwind-merge)
│   └── types/                            # auth, inputs, pet, appointment, profile,
│                                         # medicalRecord, index (barrel)
│
├── assets/                               # Iconos por defecto (personalizar con branding)
├── App.tsx                               # <Slot /> + import global.css
├── index.ts                              # expo-router/entry
├── babel.config.js                       # module-resolver (@/*) + babel-preset-expo + nativewind/babel
├── metro.config.js                       # withNativeWind({ input: './global.css' })
├── tailwind.config.js                    # preset nativewind + paleta VeteriApp
├── global.css                            # directivas @tailwind
├── nativewind-env.d.ts                   # tipos de NativeWind
├── eas.json                              # cli + development / preview / production
├── .eslintrc.json                        # extends expo, ignorePatterns: dist/node_modules/.expo
├── app.json                              # userInterfaceStyle: automatic, web.bundler: metro
├── tsconfig.json                        # extends expo/tsconfig.base + paths @/*
└── PLAN_MOBILE.md / PORTAL_CLIENT_API.md # Doc de plan y spec API
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

La API usa **JWT en cookies HttpOnly** (no `Authorization: Bearer`). El cliente Axios está preparado para ambos caminos:

- `withCredentials: true` en `apiClient` para enviar/recibir cookies.
- Interceptor de request que añade `Authorization: Bearer <token>` si hay token persistido en SecureStore (caminos futuros del backend).
- `authStore.hydrate()` verifica la sesión con `GET /auth/session` (aprovecha la cookie) antes de confiar en tokens locales.
- Al hacer login se persiste un sentinel `'cookie'` como token de marcador (la cookie real la gestiona el navegador/Safari/WebView).

> **Variable de entorno:** `EXPO_PUBLIC_API_URL` (default: `http://localhost:3000/api/v1`).

---

## Funcionalidades por pantalla

| Pantalla | Ruta | Descripción |
|----------|------|--------------|
| Login | `/(auth)/login` | Email + password, enlaces a registro y recordar contraseña |
| Registro | `/(auth)/register` | Nombre, apellido, email, password (validación Zod) |
| Recordar contraseña | `/(auth)/forgot-password` | Email → envío de correo de reseteo |
| Inicio | `/(tabs)/` | Saludo + CTA "Agendar cita" + 3 próximas citas |
| Mascotas | `/(tabs)/pets` | FlashList con pull-to-refresh y estados loading/error/empty |
| Detalle mascota | `/(tabs)/pets/[id]` | Datos completos + próximas citas + acceso a historial médico |
| Citas | `/(tabs)/appointments` | SegmentedControl Próximas/Historial + FAB nueva cita |
| Nueva cita | `/(tabs)/appointments/new` | Flujo paso a paso (mascota → categoría → fecha → hora) |
| Detalle cita | `/(tabs)/appointments/[id]` | Datos completos + cancelación inline (`Alert.alert`) |
| Perfil | `/(tabs)/profile` | Avatar + datos personales + acciones |
| Editar perfil | `/(tabs)/profile/edit` | Form Zod con firstName/lastName/email/phone/address/rut |
| Cambiar contraseña | `/(tabs)/profile/change-password` | 3 campos con validación match y distinto-a-actual |
| Historial médico | `/medical-records/[petId]` | Índice + lista de registros (CHECKUP, CONSULTATION, SURGERY, DENTAL, LAB_TEST, OTHER) |
| Vacunas | `/medical-records/[petId]/vaccinations` | Lista con badges Vencida/Próxima |
| Desparasitación | `/medical-records/[petId]/deworming` | INTERNAL/EXTERNAL/BOTH con próxima dosis |
| Condiciones crónicas | `/medical-records/[petId]/chronic-conditions` | Activas vs resueltas + severidad (MILD/MODERATE/SEVERE) |

---

## Fases / Roadmap

| Fase | Descripción | Estado |
|------|-------------|--------|
| **0** | Configuración base (Expo 57, NativeWind 4, Tailwind 3, ESLint, Metro, EAS, alias `@/*`) | ✅ |
| **1** | Proyecto base y autenticación (login, register, forgot, API client, storage, authStore, AuthGuard) | ✅ |
| **2** | Navegación y Dashboard (NativeTabs, HomeScreen, Profile, Edit, ChangePassword, hooks Query) | ✅ |
| **3** | Mascotas y Citas (listado FlashList, detalle mascota, nueva cita paso a paso, detalle cita con cancelación) | ✅ |
| **4** | Historial Médico (registros médicos, vacunas, desparasitación, condiciones crónicas) | ✅ |
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
  "cli": { "version": ">= 16.0.0", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":      { "distribution": "internal" },
    "production":   {}
  },
  "submit": { "production": {} }
}
```

```bash
pnpm eas:build:preview    # build de prueba (internal distribution)
pnpm eas:build:prod       # build de producción
```

---

## Calidad

```bash
pnpm typecheck   # tsc --noEmit   ✅ 0 errores
pnpm lint        # eslint .       ✅ 0 errores
pnpm build       # expo export    ✅ genera web/iOS/Android
```

> Sin tests todavía: dependencias instaladas pero falta `jest.config.*` y archivos `*.test.*`.

---

## Decisiones técnicas relevantes

1. **`NativeTabs` estable + nativo**: en SDK 57 usamos `expo-router/unstable-native-tabs` con SF Symbols iOS y Material Android — sin paquete de iconos extra para los tabs.
2. **NativeWind 4 + Tailwind 3** (no Tailwind 4): `react-native-css-interop` se declara como dependencia directa (era transitiva y Metro no resolvía `jsx-runtime`).
3. **Alias `@/*`**: `babel-plugin-module-resolver` enlazado a tsconfig paths para un runtime coherente.
4. **`useZodForm`** ligero (sin React-Hook-Form): controla `ValidationError`→`errors` y serializa llamadas al handler con `setIsSubmitting`/`generalError`.
5. **API en cookies HttpOnly**: `withCredentials: true` + verificación de sesión vía `GET /auth/session`; se persiste un sentinel `'cookie'` para optimizar `hydrate`.
6. **Sin `Effector`/Redux**: Zustand para estado local + TanStack Query para estado del servidor.
7. **`cn` propio** sin `clsx`/`tailwind-merge`: soporta strings, arrays y objetos condicionales.
8. **Validaciones Zod por dominio**: `validators.ts` (auth) + `newPet.ts`, `newAppointment.ts`, `editProfile.ts`, `changePassword.ts`, `rut.ts` (RUT chileno optativo).
9. **`formatDate.ts`** con `date-fns` locale `es` + `STATUS_MAP` con clases NativeWind por estado de cita.

---

## Recursos

- [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router — Native Tabs](https://docs.expo.dev/versions/v57.0.0/sdk/router/native-tabs.md)
- [NativeWind v4 setup](https://www.nativewind.dev/docs/getting-started/installation)
- [`PLAN_MOBILE.md`](./PLAN_MOBILE.md) — plan maestro completo
- [`PORTAL_CLIENT_API.md`](./PORTAL_CLIENT_API.md) — especificación de la API REST

---

## Licencia

[MIT](./LICENSE) — heredada del template de Expo (Copyright © 2015-present 650 Industries, Inc.).
