# Plan Maestro: App Móvil - Portal del Cliente VeteriApp

> **Versión:** 2.7.0
> **Fecha:** 2026-07-09
> **Stack:** React Native + Expo (SDK 57) | API REST (Portal Client API v1)
> **Repositorio único:** `veteriApp-mobile`
> **Gestor de paquetes:** pnpm

### Progreso General

| Fase | Estado | Detalle |
|------|--------|---------|
| **0. Configuración base** | ✅ Completo | Expo SDK 57, NativeWind 4 + Tailwind 3, TypeScript 5.5, ESLint (`expo` + `import/no-unresolved` para `.css`), Metro con `withNativeWind`, EAS, `app.json` (`userInterfaceStyle: automatic`, `web.bundler: metro`), alias `@/*` (babel `module-resolver` + tsconfig paths) |
| **Fase 1 — Proyecto Base y Autenticación** | ✅ Completo | API client Axios (interceptor Bearer + `withCredentials` para cookies HttpOnly), storage seguro, `authStore` Zustand, validadores Zod 4, QueryClient provider, UI base (`Button`, `Input`), tres formularios (`Login`, `Register`, `ForgotPassword`), tres pantallas bajo `app/(auth)/*`, `AuthGuard`, root layout con guard, `(tabs)` placeholder, `App.tsx` Slot, entry de Expo Router, **build verde (`expo export` genera web/iOS/android bundles)** |
| **Fase 2 — Navegación y Dashboard** | ✅ Completo | `NativeTabs` (4 tabs nativas: Inicio, Mascotas, Citas, Perfil) con SF Symbols iOS + Material Android; `HomeScreen` con próximas citas + CTA agendar; `ProfileScreen`, `EditProfileScreen`, `ChangePasswordScreen` con TanStack Query; hooks (`useProfile`, `usePets`, `useAppointments`, `usePublicSettings`, `useCategories`); API endpoints `pets`, `appointments`, `profile`, `public`; UI libs (`Card`, `Badge`, `Avatar`, `Section`, `AppointmentCard`, `Loading/Empty/ErrorState`); helpers (`formatDate`, `formatDateTime`, `isFuture`, `getAppointmentStatus`); build verde |
| **Fase 3 — Mascotas y Citas** | ✅ Completo | `PetsListScreen` (FlashList + `PetCard` memoizado + pull-to-refresh), `PetDetailScreen` (detalle completo + citas próximas), `AppointmentsListScreen` (segmented control Próximas/Historial + `AppointmentRow` memoizado + FAB), `NewAppointmentScreen` (step-by-step: mascota/categoría/fecha/hora/motivo), `AppointmentDetailScreen` (detalle completo + cancelar con confirmación inline), Zod validators (`newPet`, `newAppointment`), UI components nuevos (`ScreenHeader`, `Pill`, `SelectRow`, `SegmentedControl`), `PetCard` + `AppointmentRow` memoizados con props primitivos, navegación corregida en Home y AppointmentsList; **`pnpm typecheck`, `pnpm lint` limpios; build verde** |
| **Fase 4 — Historial Médico** | ✅ Completo | Historial médico completo con 4 secciones (registros, vacunas, desparasitación, condiciones crónicas) + navegación desde detalle de mascota |
| **Fase 5 — Notificaciones Push** | ⏳ Pendiente | — |

---

## 1. Visión General

Crear una **app móvil nativa** (iOS/Android) que funcione como el **Portal del Cliente** de VeteriApp, permitiendo a los dueños de mascotas gestionar sus citas, ver el historial médico de sus mascotas y editar su perfil desde cualquier lugar.

### 1.1 Objetivos

| Objetivo | Descripción |
|----------|-------------|
| **NX-01** | App nativa para iOS y Android usando Expo (última versión) |
| **NX-02** | Consumir la API REST documentada en `PORTAL_CLIENT_API.md` sin modificar la lógica de negocio |
| **NX-03** | Mantener el backend (Next.js) intacto y sin cambios en su estructura |
| **NX-04** | Soportar autenticación via JWT en cookies HttpOnly (ver `PORTAL_CLIENT_API.md`, sección *Autenticación*) — el cliente móvil hace `withCredentials: true` y verifica sesión con `GET /api/v1/auth/session` |
| **NX-05** | Preparar la infraestructura para notificaciones push |
| **NX-06** | Repositorio único para la app móvil |

---

## 2. Arquitectura

### 2.1 Estructura del Proyecto (Repo Único)

> **Leyenda:** `✅ implementado (Fase 1)` · `⏳ pendiente` (carpeta vacía reservada para la fase indicada)

```
veteriApp-mobile/
├── app/                                  # Expo Router (file-based)
│   ├── (auth)/                           # Auth stack
│   │   ├── _layout.tsx                   ✅ SafeArea + KeyboardAvoiding + Stack
│   │   ├── login.tsx                     ✅ Usa <LoginForm> + Link a register/forgot
│   │   ├── register.tsx                  ✅ Usa <RegisterForm> + back to login
│   │   └── forgot-password.tsx           ✅ Usa <ForgotPasswordForm> con pantalla de éxito
│   │
│   ├── (tabs)/                           # Native bottom tabs (Fase 2)
│   │   ├── _layout.tsx                   ✅ NativeTabs (Inicio/Mascotas/Citas/Perfil)
│   │   ├── index.tsx                     ✅ HomeScreen: saludo, CTA agendar, próximas 3 citas, placeholder notificaciones
│   │   ├── pets/
│   │   │   ├── _layout.tsx               ✅ Stack placeholder
│   │   │   ├── index.tsx                 ✅ `PetsListScreen`: FlashList + `PetCard` memoizado + pull-to-refresh (Fase 3)
│   │   │   └── [id].tsx                  ✅ `PetDetailScreen`: detalle completo, citas próximas, historial placeholder (Fase 3)
│   │   ├── appointments/
│   │   │   ├── _layout.tsx               ✅ Stack placeholder
│   │   │   ├── index.tsx                 ✅ `AppointmentsListScreen`: segmented control Próximas/Historial + FAB + `AppointmentRow` memoizado (Fase 3)
│   │   │   ├── new.tsx                   ⏳ Pantalla nueva cita (Fase 3)
│   │   │   └── [id].tsx                  ⏳ Detalle de cita (Fase 3)
│   │   └── profile/
│   │       ├── _layout.tsx               ✅ Stack placeholder
│   │       ├── index.tsx                 ✅ ProfileScreen con datos + acciones (editar/cambiar pass/logout)
│   │       ├── edit.tsx                  ✅ EditProfileScreen con Zod + useUpdateProfile
│   │       └── change-password.tsx       ✅ ChangePasswordScreen con Zod + useChangePassword
│   │
│   ├── medical-records/                  ⏳ (Fase 4)
│   │
│   ├── +not-found.tsx                    ✅ Pantalla 404 con redirección por sesión
│   └── _layout.tsx                       ✅ Root (QueryClientProvider + SafeAreaProvider + AuthGuard + Stack)
│
├── src/
│   ├── api/
│   │   ├── client.ts                     ✅ Axios con interceptor Bearer + withCredentials
│   │   ├── auth.ts                       ✅ login/logout/getSession/forgotPassword/resetPassword/register
│   │   ├── pets.ts                       ✅ getPets / getPet / createPet / updatePet
│   │   ├── appointments.ts               ✅ getAppointments / createAppointment / updateAppointment
│   │   ├── profile.ts                    ✅ getProfile / updateProfile / changePassword
│   │   ├── public.ts                     ✅ getPublicSettings (schedule + holidays) + getCategories
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                ✅ Variants primary/secondary/ghost, sizes sm/md/lg, loading, async onPress
│   │   │   ├── Input.tsx                 ✅ Label + error + hint, forwardRef
│   │   │   ├── Card.tsx                  ✅ Contenedor "card" con borde y padding
│   │   │   ├── Badge.tsx                 ✅ Pill de estado customizable (label/bgClass/textClass)
│   │   │   ├── Avatar.tsx                ✅ Imagen o iniciales calculadas
│   │   │   ├── Section.tsx               ✅ Encabezado (title/subtitle/trailing) + gap configurable
│   │   │   ├── ScreenHeader.tsx          ✅ Header reutilizable con back button, título, subtítulo y trailing (Fase 3)
│   │   │   ├── Pill.tsx                  ✅ Selector tipo pill con color, selected y onPress (Fase 3)
│   │   │   ├── SelectRow.tsx             ✅ Fila seleccionable con label/value/placeholder/chevron (Fase 3)
│   │   │   └── SegmentedControl.tsx      ✅ Control segmentado para tabs Próximas/Historial (Fase 3)
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx             ✅ Zod + useAuthStore.login
│   │   │   ├── RegisterForm.tsx          ✅ Zod + authApi.register
│   │   │   └── ForgotPasswordForm.tsx    ✅ Zod + authApi.forgotPassword + banner de éxito
│   │   ├── feedback/
│   │   │   ├── AuthGuard.tsx             ✅ Spinner/loading + redirect segun status
│   │   │   └── States.tsx                ✅ Loading, Empty y ErrorState reutilizables
│   │   └── lists/
│   │       ├── AppointmentCard.tsx       ✅ Tarjeta de cita con avatar + fecha + vet + status (Fase 2)
│   │       ├── PetCard.tsx               ✅ `PetCard` memoizado: avatar + nombre + especie/raza + chevron (Fase 3)
│   │       └── AppointmentRow.tsx        ✅ `AppointmentRow` memoizado: avatar + fecha + status + chevron (Fase 3)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                    ✅ Wrapper DX-friendly sobre authStore
│   │   ├── useAuthStore.ts               ✅ Reexport named de Zustand + AuthState
│   │   ├── useProfile.ts                 ✅ useProfile / useUpdateProfile / useChangePassword (TanStack Query)
│   │   ├── usePets.ts                    ✅ usePets / usePet / create / update
│   │   ├── useAppointments.ts            ✅ useAppointments / create / update
│   │   └── usePublicSettings.ts          ✅ usePublicSettings + useCategories
│   │
│   ├── store/
│   │   ├── authStore.ts                  ✅ Zustand: hydrate/login/logout/refreshSession/clearError
│   │   └── settingsStore.ts              ⏳ (Fase 3)
│   │
│   ├── lib/
│   │   ├── storage.ts                    ✅ Wrapper expo-secure-store (get/set/delete)
│   │   ├── storageKeys.ts                ✅ Constantes de keys SecureStore
│   │   ├── validators.ts                 ✅ Zod schemas login/register/forgotPassword/resetPassword
│   │   ├── changePassword.ts             ✅ Zod schema change-password
│   │   ├── editProfile.ts                ✅ Zod schema edit-profile (Fase 2)
│   │   ├── newPet.ts                     ✅ Zod schema newPet (name, species, breed, birthDate, weight, sex, reproductiveStatus, specialCharacteristics, microchipNumber) (Fase 3)
│   │   ├── newAppointment.ts              ✅ Zod schema newAppointment (petId, categoryId, reason, date, notes) con refine de fecha futura (Fase 3)
│   │   ├── errors.ts                     ✅ ApiRequestError + unwrap + getErrorMessage
│   │   ├── queryClient.ts                ✅ QueryClient singleton
│   │   ├── useZodForm.ts                 ✅ Hook controlado (sin RHF) para forms
│   │   ├── cn.ts                         ✅ Utilidad para concatenar clases
│   │   ├── formatDate.ts                 ✅ Helpers date-fns + mapa status -> badge
│   │   └── rut.ts                        ✅ Validador RUT chileno (perfil/edit)
│   │
│   └── types/
│       ├── auth.ts                       ✅ Role, AuthUser, LoginResponse, SessionResponse, ApiResponse
│       ├── inputs.ts                     ✅ LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput
│       ├── pet.ts                        ✅ Pet, PetsListResponse, PetCreateInput, PetUpdateInput
│       ├── appointment.ts                ✅ Appointment, AppointmentStatus, CreateAppointmentInput, UpdateAppointmentInput
│       ├── profile.ts                    ✅ Profile, ProfileUpdateInput, Region/Comuna
│       └── index.ts                      ✅ Barrel
│
├── assets/                               ⏳ Iconos por defecto (a personalizar Fase 1 cierre / branding)
├── babel.config.js                       ✅ Module-resolver (@/), preset Expo (jsxImportSource: nativewind), nativewind/babel
├── metro.config.js                       ✅ withNativeWind(config, { input: "./global.css" })
├── tailwind.config.js                    ✅ Preset nativewind + theme.extend.colors VeteriApp
├── global.css                            ✅ @tailwind base/components/utilities
├── nativewind-env.d.ts                   ✅ /// <reference types="nativewind/types" />
├── eas.json                              ✅ development / preview / production
├── .eslintrc.json                        ✅ expo + ignore para .css + ignorePatterns dist/node_modules
├── tsconfig.json                         ✅ expo/tsconfig.base + alias @/* + paths
├── app.json                              ✅ userInterfaceStyle: automatic, web.bundler: metro
├── App.tsx                               ✅ Slot + import global.css (bootstrap)
├── index.ts                              ✅ import "expo-router/entry"
├── package.json                          ✅ packageManager pnpm@9.15.1 + scripts (start/android/ios/web/build/test/lint/typecheck/eas:*)
├── pnpm-lock.yaml                        ✅ único lockfile (npm eliminado)
└── tsconfig.json
```
│
├── assets/                     # Imágenes, iconos, fonts
├── eas.json                    # Configuración de EAS Build
├── app.json                    # Configuración Expo
├── package.json
├── pnpm-lock.yaml             # Lock file de pnpm
└── tsconfig.json
```

### 2.2 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Framework** | React Native + Expo | SDK 57 |
| **Lenguaje** | TypeScript | 5.x (Compat.) |
| **Navegación** | Expo Router + Native Bottom Tabs | v57 |
| **Estilos** | NativeWind (Tailwind CSS 3 para RN) | 4.x |
| **Gestión de Estado** | Zustand | 5.x |
| **Data Fetching** | TanStack Query (React Query) | 5.x |
| **HTTP Client** | Axios | 1.x |
| **Validación** | Zod | 4.x |
| **Almacenamiento Seguro** | expo-secure-store | 57.x |
| **Listas Virtualizadas** | FlashList (@shopify/flash-list) | 2.x |
| **Notificaciones Push** | expo-notifications | 57.x |
| **Testing** | Jest + React Native Testing Library | - |

> **Nota:** NativeWind 4.x requiere **Tailwind CSS 3.4.x** (la v4 de Tailwind no es compatible con NativeWind 4).
> **Nota Zod:** Zod 4.x funciona con los schemas del presente plan (`z.string().email()` está deprecado pero operativo; se recomienda `z.email()` por consistencia).

---

## 3. API Endpoints (Del PORTAL_CLIENT_API.md)

### 3.1 Autenticación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Iniciar sesión (setea cookie HttpOnly con JWT) |
| `/api/v1/auth/logout` | POST | Cerrar sesión |
| `/api/v1/auth/session` | GET | Verificar sesión activa (aprovecha cookie) |
| `/api/v1/auth/forgot-password` | POST | Solicitar recuperación de contraseña |
| `/api/v1/auth/reset-password` | POST | Restablecer contraseña con token |
| `/api/v1/auth/register` | POST | Registro público (Fase 1 implementado — pendiente de confirmar al backend, no figura en `PORTAL_CLIENT_API.md` original) |

### 3.2 Perfil

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/profile` | GET | Obtener datos del usuario |
| `/api/v1/profile` | PUT | Actualizar datos del usuario |
| `/api/v1/profile/password` | PUT | Cambiar contraseña |

### 3.3 Mascotas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/pets` | GET | Listar mascotas del cliente |
| `/api/v1/pets` | POST | Registrar nueva mascota |
| `/api/v1/pets/[id]` | GET | Detalle de una mascota |
| `/api/v1/pets/[id]` | PUT | Actualizar mascota |

### 3.4 Citas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/appointments` | GET | Listar citas del cliente |
| `/api/v1/appointments` | POST | Solicitar nueva cita |
| `/api/v1/appointments/[id]` | PUT | Actualizar/cancelar cita |

### 3.5 Historial Médico

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/medical-records?petId=X` | GET | Obtener registros médicos |
| `/api/v1/pets/[id]/vaccinations` | GET | Historial de vacunas |
| `/api/v1/pets/[id]/deworming` | GET | Historial de desparasitación |
| `/api/v1/pets/[id]/chronic-conditions` | GET | Condiciones crónicas/alergias |

### 3.6 Configuración Pública (Sin Auth)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/public/settings` | GET | Horarios y días festivos |

### 3.7 Categorías

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/categories` | GET | Listar categorías disponibles |

---

## 4. Modelo de Datos

### 4.1 Enums (según API)

```typescript
type Role = "ADMIN" | "VET" | "RECEPTIONIST" | "CLIENT"
type Sex = "MALE" | "FEMALE"
type ReproductiveStatus = "FERTILE" | "STERILIZED" | "CASTRATED"
type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
type DewormingType = "INTERNAL" | "EXTERNAL" | "BOTH"
```

### 4.2 Estados de Cita (Badges)

| Estado | Color | Texto |
|--------|-------|-------|
| PENDING | `#F59E0B` (warning) | Pendiente |
| CONFIRMED | `#10B981` (success) | Confirmada |
| COMPLETED | `#3B82F6` (primary) | Completada |
| CANCELLED | `#EF4444` (danger) | Cancelada |
| NO_SHOW | `#6B7280` (gray) | No asistió |

---

## 5. Pantallas y Navegación

### 5.1 Navegación Principal

```
Root (Native Stack)
├── (auth)                    # Auth Stack (no logueado)
│   ├── login
│   ├── register
│   └── forgot-password
│
└── (tabs)                   # Bottom Tabs (logueado)
    ├── Home (Dashboard)
    ├── Pets
    ├── Appointments
    └── Profile
```

### 5.2 Detalle de Pantallas

#### (auth) Stack

| Pantalla | Campos | Validación |
|----------|--------|------------|
| `login` | email, password | email válido, password no vacío |
| `register` | firstName, lastName, email, password, confirmPassword | RUT chileno, password 8+ chars con mayúscula y número |
| `forgot-password` | email | email válido |

#### Home (Dashboard)

- Bienvenida personalizada con nombre del usuario
- Próximas citas (próximas 3)
- Tarjeta rápida: "Agendar nueva cita"
- Notificaciones placeholder

#### Pets Tab

| Pantalla | Contenido |
|----------|-----------|
| `pets/index` | Lista de mascotas con FlashList |
| `pets/[id]` | Detalle completo, enlace a historial médico |

#### Appointments Tab

| Pantalla | Contenido |
|----------|-----------|
| `appointments/index` | Tabs: Próximas / Historial, badges de estado |
| `appointments/new` | Selector de mascota, fecha, hora, categoría, motivo |
| `appointments/[id]` | Detalle completo, botón cancelar |

#### Profile Tab

| Pantalla | Contenido |
|----------|-----------|
| `profile/index` | Datos del usuario, botón editar, botón cambiar contraseña |
| `profile/edit` | Formulario editar nombre, email, teléfono, dirección |
| `profile/change-password` | Contraseña actual, nueva contraseña, confirmar |

#### Medical Records

| Pantalla | Contenido |
|----------|-----------|
| `medical-records/[petId]` | Registros médicos de la mascota |
| `medical-records/[petId]/vaccinations` | Calendario de vacunación |
| `medical-records/[petId]/deworming` | Historial desparasitación |
| `medical-records/[petId]/chronic-conditions` | Alergias y condiciones crónicas |

---

## 6. Fases de Implementación

### Fase 1: Proyecto Base y Autenticación
**Objetivo:** Configurar proyecto, implementar login/logout/registro.

**Estado:** ✅ **Completado** (2026-07-08)

**Tareas:**
- [x] Crear proyecto Expo con TypeScript (SDK 57)
- [x] Configurar NativeWind y tema (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`)
- [x] Implementar API client con Axios (interceptor Authorization + `withCredentials: true` para cookies HttpOnly) — `src/api/client.ts`
- [x] Implementar storage seguro sobre `expo-secure-store` — `src/lib/storage.ts`
- [x] Implementar endpoints de auth — `src/api/auth.ts` (`login`, `logout`, `getSession`, `forgotPassword`, `resetPassword`, `register`)
- [x] Implementar Zod validators (`login`, `register`, `forgot`, `changePassword`) — `src/lib/validators.ts` + `changePassword.ts`
- [x] Implementar auth store con Zustand — `src/store/authStore.ts` (`hydrate`, `login`, `logout`, `refreshSession`, `clearError`)
- [x] Implementar QueryClient provider — `src/lib/queryClient.ts`
- [x] Implementar componente UI `Button` e `Input` con NativeWind — `src/components/ui/`
- [x] Implementar `LoginScreen` — `app/(auth)/login.tsx` + `src/components/forms/LoginForm.tsx`
- [x] Implementar `RegisterScreen` — `app/(auth)/register.tsx` + `src/components/forms/RegisterForm.tsx`
- [x] Implementar `ForgotPasswordScreen` — `app/(auth)/forgot-password.tsx` + `src/components/forms/ForgotPasswordForm.tsx`
- [x] Configurar Expo Router (`app/_layout.tsx`, `app/(auth)/_layout.tsx`, `App.tsx` como Slot, `index.ts` → `expo-router/entry`)
- [x] Crear `AuthGuard` con spinner/loading + redirect si no hay sesión — `src/components/feedback/AuthGuard.tsx`
- [x] Proteger rutas (status `unauthenticated`/(zona privada) → redirect a `/(auth)/login`; `authenticated`/(zona auth) → redirect a `/(tabs)`)
- [x] Verificación de calidad: `pnpm typecheck`, `pnpm lint`, `pnpm build` (`expo export` → web/iOS/android bundles OK)
- [x] **Commit:** `(feat) Fase 1: Proyecto base y autenticación` — pendiente a la decisión del usuario

**Decisiones técnicas relevantes:**
1. **Autenticación real por cookies HttpOnly** (no Bearer puro): `withCredentials: true` en Axios + verificación de sesión mediante `GET /api/v1/auth/session` desde `authStore.hydrate()` (aprovecha la cookie). El header `Authorization: Bearer` se envía solo si hay token persistido en SecureStore (compatibilidad hacia atrás si el backend migra a Bearer).
2. **NativeWind 4 + Tailwind CSS 3.4.x**: `react-native-css-interop` añadido como dependencia directa (era transitiva y Metro no resolvía `jsx-runtime`); `tg=node_modules/nativewind/dist` apunta al preset/tailwind/preset. Mantener Tailwind **en 3.4.x** es obligatorio.
3. **Alias `@/*`** vía `babel-plugin-module-resolver` + tsconfig `paths` para construir un runtime consistente entre Babel y TypeScript.
4. **`useZodForm`** ligero (sin React-Hook-Form) para mantener el bundle pequeño y evitar contratos con NativeWind controlado manual.
5. **`AuthGuard`** funciona como redirect server-side logic: hay un spinner mientras `status === 'idle'|'loading'`. Cuando `status === 'authenticated'` NO renderiza la zona `(auth)`, etc.
6. **`expo export`** produce bundles exitosos para las tres plataformas; cualquier cambio futuro en babel/metro/nativewind debe re-validarse con `pnpm build`.

### Fase 2: Navegación y Dashboard

### Fase 2: Navegación y Dashboard
**Objetivo:** Implementar navegación tabs y home.

**Estado:** ✅ **Completado** (2026-07-08)

**Tareas:**
- [x] Configurar Expo Router con `NativeTabs` nativos (`expo-router/unstable-native-tabs`)
  - 4 tabs: **Inicio / Mascotas / Citas / Perfil**
  - SF Symbols iOS (`house`, `pawprint`, `calendar`, `person.crop.circle`) + Material Android (`home`, `pets`, `event`, `person`)
- [x] Implementar `HomeScreen` (`app/(tabs)/index.tsx`) con:
  - Saludo personalizado (`useAuth().user.firstName`)
  - Tarjeta rápida "Agendar nueva cita" → push al tab de citas (placeholder por ahora; Fase 3 crea el formulario real)
  - Liste las **próximas 3 citas** vía `useAppointments()` filtrando por fecha futura y status distinto de `CANCELLED`
  - Placeholder de notificaciones
  - `RefreshControl` para pull-to-refresh
  - `useFocusEffect` para re-fetch al volver a la pantalla
  - Estados `Loading`, `Empty`, `ErrorState` reusables
- [x] Implementar `ProfileScreen` (`app/(tabs)/profile/index.tsx`) con `useProfile()` mostrando email, teléfono, dirección, RUT, comuna y región; estado de carga; acciones: Editar / Cambiar contraseña / **Cerrar sesión** (`useAuth().logout`)
- [x] Implementar `EditProfileScreen` (`app/(tabs)/profile/edit.tsx`) con `useZodForm` + `editProfileSchema`, invocando `useUpdateProfile` (TanStack Query mutation) con invalidación y feedback de éxito
- [x] Implementar `ChangePasswordScreen` (`app/(tabs)/profile/change-password.tsx`) con `changePasswordSchema` y `useChangePassword`
- [x] Implementar `pets/index.tsx` y `appointments/index.tsx` (listado básico, **CRUD/detail se completará en Fase 3**; tamaño mensaje de "Próximamente" en el de citas)
- [x] Hooks TanStack Query: `useProfile`, `useUpdateProfile`, `useChangePassword`, `usePets`, `usePet`, `useCreatePet`, `useUpdatePet`, `useAppointments`, `useCreateAppointment`, `useUpdateAppointment`, `usePublicSettings`, `useCategories`
- [x] API endpoints: `pets`, `appointments`, `profile`, `public` (settings + categorías)
- [x] Componentes UI nuevos: `Card`, `Badge`, `Avatar` (con iniciales fallback), `Section`
- [x] Componentes feedback nuevos: `Loading`, `Empty`, `ErrorState`
- [x] Listas: `AppointmentCard` (avatar mascota + formateo fecha con futura vs pasada + vet + status)
- [x] Helpers: `formatDate`, `formatDateTime`, `formatTime`, `fromNow`, `isFuture`, `getAppointmentStatus` (color por estado)
- [x] Barrel de tipos actualizado con `pet`, `appointment`, `profile`
- [x] Validación final: `pnpm typecheck`, `pnpm lint`, `pnpm build` (web 3 MB, iOS 5.5 MB, Android 5.7 MB; módulo `native-tabs.module.css` compilado)
- [x] **Commit:** `(feat) Fase 2: Navegación y Dashboard` — pendiente a la decisión del usuario

**Notas técnicas relevantes:**
1. **`NativeTabs` unstable**: en SDK 57 se importa de `expo-router/unstable-native-tabs` (no requiere paquete adicional). Resuelve iconos con SF Symbols / Material sin necesidad de paquete de iconos adicional.
2. **Per-tap `_layout.tsx` con `Stack`**: cada tab (`pets`, `appointments`, `profile`) tiene su propio `_layout` con Stack para soportar navegación interna (detalles/detalle/Fase 3-4) sin mezclarse con la jerarquía de tabs.
3. **`useUpdateProfile` con invalidación selectiva**: `setQueryData` actualiza el cache de `['profile']` con la respuesta; sin invalidar `['appointments']` etc.
4. **`formatDate.ts`**: tabla única de `STATUS_MAP` que mapea cada `AppointmentStatus` a `Badge` colors/t(`warning`/`success`/`primary`/`danger`/`gray`)`. El `AppointmentCard` consume este helper para mantener la vista y la lógica de status en un solo lugar.
5. **Avatar fallback**: cuando no hay `imageUrl`, se dibuja un círculo con iniciales (`useMemo`/`fn` no necesaria porque solo se ejecuta al renderizar). El tamaño se controla con `size` prop.
6. **`useFocusEffect(refetch)`: cada vez que el usuario vuelve a Home se re-fetchan citas y mascotas. Combinado con `RefreshControl` permite pull-to-refresh manual.

### Fase 3: Mascotas y Citas
**Objetivo:** Implementar módulos de mascotas y citas.

**Estado:** ✅ **Completo** (2026-07-09)

**Tareas:**
- [x] `PetsListScreen` (`app/(tabs)/pets/index.tsx`) con `FlashList` + `PetCard` memoizado + pull-to-refresh (`RefreshControl`) + `useFocusEffect` para re-fetch al volver
- [x] `PetDetailScreen` (`app/(tabs)/pets/[id].tsx`) con: datos completos de la mascota, badges de especie/sexo, filas de detalle (raza, nacimiento, peso, estado reproductivo, microchip), características especiales, próximas citas filtradas por `petId`, placeholder de historial (Fase 4)
- [x] `AppointmentsListScreen` (`app/(tabs)/appointments/index.tsx`) con: `SegmentedControl` (Próximas/Historial), `AppointmentRow` memoizado, FAB (botón flotante `+`) para nueva cita, pull-to-refresh, sorting por fecha
- [x] `NewAppointmentScreen` (`app/(tabs)/appointments/new.tsx`): flujo paso a paso (mascota → categoría → fecha → hora → motivo/notas), selector visual con estado `Step`, integración con `usePets`/`useCategories`/`usePublicSettings`, `useCreateAppointment`, feedback de éxito y redirect al detalle de la nueva cita
- [x] `AppointmentDetailScreen` (`app/(tabs)/appointments/[id].tsx`): datos completos de la cita con iconos, badge de estado, botón cancelar con confirmación inline (`Alert.alert`), estados según permiso del endpoint PUT
- [x] Validadores Zod: `newPetSchema` (`src/lib/newPet.ts`) y `newAppointmentSchema` (`src/lib/newAppointment.ts`) con refine de fecha futura
- [x] UI components: `ScreenHeader`, `Pill`, `SelectRow`, `SegmentedControl`
- [x] `PetCard` memoizado (`src/components/lists/PetCard.tsx`) con primitivas como props (`id`, `name`, `species`, `breed`, `birthDate`, `weight`, `onPress`) para optimizar FlashList
- [x] `AppointmentRow` memoizado (`src/components/lists/AppointmentRow.tsx`) con primitivas como props y `onPress(id)`
- [x] Integración de `useFocusEffect` + `RefreshControl` en todas las pantallas de listado para pull-to-refresh
- [x] Navegación corregida: Home CTA y AppointmentsListScreen FAB usan `router.push('/(tabs)/appointments/new')` limpio (sin cast `as never`)
- [ ] **Commit:** `(feat) Fase 3: Mascotas y Citas` — pendiente a la decisión del usuario

**Notas técnicas relevantes:**
1. **`FlashList` + `PetCard` memoizado**: se respetan las reglas de `list-performance-item-memo` — se pasan primitivas (`id`, `name`, `species`) al `PetCard`, que internamente usa `useCallback` para el `onPress`. La prop `estimatedItemSize` se omitió por incompatibilidad de tipos en esta versión de FlashList; la lista funciona con medición dinámica.
2. **`AppointmentRow` memoizado**: a diferencia del `AppointmentCard` original (que recibe un objeto `appointment`), el `AppointmentRow` recibe primitivas y usa `useCallback` internamente, evitando re-renders innecesarios en listas.
3. **`SegmentedControl` genérico**: componente reutilizable `<SegmentedControl<T>>` con tipos generics para las opciones, inspirado en el patrón de `list-performance-virtualize` del skill de React Native.
4. **`NewAppointmentScreen` step-by-step**: flujo de 4 pasos (`pet → category → date → time → form`) usando estado local `Step`; cada paso es una "pantalla" separada con su propio UI, volviendo al formulario principal al seleccionar.
5. **Sin dependencias adicionales para date picker**: se decidió no agregar `@react-native-community/datetimepicker` — la selección de fecha usa chips de día (próximos 7 días laborables) y hora (slots predefinidos de 09:00 a 18:00), alimentada por `usePublicSettings` (para filtrado de días festivos en una mejora futura).
6. **`useFocusEffect` en todas las pantallas**: patrón consistente aplicado a `PetsListScreen`, `PetDetailScreen` y `AppointmentsListScreen` para re-fetchar datos cada vez que la pantalla recibe foco.
7. **Validación de calidad**: `pnpm typecheck` ✅, `pnpm lint` (0 errores, 0 warnings) ✅, `pnpm build` genera web + iOS bundles sin errores de compilación ✅.

### Fase 4: Historial Médico
**Objetivo:** Completar funcionalidades del portal.

**Estado:** ✅ **Completo** (2026-07-10)

**Tareas:**
- [x] Implementar vista de historial médico (`app/medical-records/[petId]/index.tsx`)
- [x] Implementar vista de vacunas (`app/medical-records/[petId]/vaccinations.tsx`)
- [x] Implementar vista de desparasitación (`app/medical-records/[petId]/deworming.tsx`)
- [x] Implementar vista de condiciones crónicas (`app/medical-records/[petId]/chronic-conditions.tsx`)
- [x] Tipos TypeScript (`src/types/medicalRecord.ts`)
- [x] API endpoints (`src/api/medicalRecords.ts`)
- [x] Hooks TanStack Query (`src/hooks/useMedicalRecords.ts`)
- [x] Actualizar PetDetailScreen con enlace real al historial médico
- [ ] **Commit:** `(feat) Fase 4: Historial Médico` — pendiente a la decisión del usuario

**Notas técnicas relevantes:**
1. **Navegación estructurada:** `/medical-records/[petId]/` con 4 sub-pantallas accesibles desde la pantalla principal.
2. **Tipos completos:** `MedicalRecord`, `Vaccination`, `Deworming`, `ChronicCondition` con sus tipos de respuesta (`*ListResponse`).
3. **Validación de calidad:** `pnpm typecheck` ✅, `pnpm lint` (0 warnings) ✅, build (web + android bundles generados antes de timeout).

### Fase 5: Notificaciones Push (Infraestructura)
**Objetivo:** Preparar infraestructura de notificaciones.

**Tareas:**
- [ ] Configurar expo-notifications
- [ ] Crear endpoint PUT `/api/v1/profile/push-token` (verificar con backend)
- [ ] Implementar lógica de solicitud de permisos
- [ ] Preparar templates de notificaciones
- [ ] **Commit:** `(feat) Fase 5: Notificaciones Push (Infraestructura)`

---

## 7. Validaciones (Zod Schemas)

```typescript
// Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register
const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Debe tener al menos 1 mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos 1 número'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
});

// Nueva Cita
const newAppointmentSchema = z.object({
  date: z.string().refine(date => new Date(date) > new Date(), 'La fecha no puede ser en el pasado'),
  reason: z.string().min(1),
  categoryId: z.string().uuid(),
  petId: z.number().int().positive(),
  notes: z.string().optional(),
});

// Cambiar Contraseña
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente',
});
```

---

## 8. Dependencias

### 8.1 package.json (ejemplo completo)

```json
{
  "name": "veteriapp-mobile",
  "version": "1.0.0",
  "private": true,
  "main": "index.ts",
  "packageManager": "pnpm@9.15.1",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo export",
    "test": "jest",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "eas:build": "eas build",
    "eas:build:preview": "eas build --profile preview",
    "eas:build:prod": "eas build --profile production"
  },
  "dependencies": {
    "expo": "~57.0.0",
    "expo-router": "~57.0.0",
    "expo-secure-store": "~57.0.0",
    "expo-notifications": "~57.0.0",
    "expo-status-bar": "~57.0.0",
    "nativewind": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@shopify/flash-list": "^2.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "zod": "^4.0.0",
    "react-native-svg": "~15.15.0",
    "lucide-react-native": "^1.23.0",
    "date-fns": "^4.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~19.2.0",
    "typescript": "~5.5.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0",
    "eslint": "^8.57.0",
    "tailwindcss": "^3.4.0"
  }
}
```

> **Importante versionado:**
> - `tailwindcss` **debe ser 3.4.x** (NO 4.x) para que NativeWind 4 funcione.
> - Lubricar entre `latest` y `~X.Y.0` con la herramienta `npx expo install --fix` tras cada cambio.
> - Los paquetes `expo-*` **deben** alinearse con el SDK 57; usa `npx expo install --fix` para corregirlos automáticamente.

---

## 9. Scripts Disponibles

```bash
# Instalar dependencias (usar SIEMPRE pnpm, NO npm ni yarn)
pnpm install

# Desarrollo
pnpm start           # Iniciar Expo
pnpm android         # Iniciar en Android
pnpm ios             # Iniciar en iOS

# Build
pnpm build           # Build local (genera apk/aab)
pnpm export          # Exportar bundle para web

# EAS Build (builds en la nube)
pnpm eas:build                    # Build interactivo
pnpm eas:build --profile preview # Preview build
pnpm eas:build --profile prod    # Production build

# Calidad de código
pnpm test            # Tests con Jest
pnpm lint            # ESLint
pnpm typecheck       # TypeScript check
```

### 9.1 Notas sobre pnpm

- **Siempre usar `pnpm install`** para instalar dependencias
- NO usar `npm install` ni `yarn add` - genera lockfiles incompatibles
- Si hay problemas de symlinks, usar `pnpm install --force`
- Para limpiar cache: `pnpm store prune`

---

## 10. Buenas Prácticas (React Native)

### Listas - Usar FlashList
```tsx
import { FlashList } from '@shopify/flash-list'

function PetsList({ pets }: { pets: Pet[] }) {
  return (
    <FlashList
      data={pets}
      renderItem={({ item }) => <PetCard pet={item} />}
      keyExtractor={item => item.id.toString()}
      estimatedItemSize={100}
    />
  )
}
```

### Navegación - Native Stack
```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()
```

### Imágenes - expo-image
```tsx
import { Image } from 'expo-image'

<Image source={url} contentFit='cover' />
```

### Estado - Minimizar suscripciones
```typescript
// En lugar de
const { user, token, loading } = useAuthStore()

// Preferir selectors específicos
const user = useAuthStore(state => state.user)
```

---

## 11. Glosario

| Término | Definición |
|---------|------------|
| **Expo** | Framework y plataforma para React Native |
| **Expo Router** | Navegación basada en archivos para Expo |
| **NativeWind** | Tailwind CSS para React Native |
| **FlashList** | Lista virtualizada de Shopify para React Native |
| **Zustand** | Librería para gestión de estado |
| **TanStack Query** | Librería para data fetching y cache |
| **EAS Build** | Servicio de Expo para builds en la nube |

---

*Documento actualizado el 2026-07-09 (v2.7.0 — Fase 3 completada: PetsListScreen (FlashList), PetDetailScreen, AppointmentsListScreen (SegmentedControl), NewAppointmentScreen (step-by-step flow), AppointmentDetailScreen (cancel inline), AppointmentRow memoizado, nuevos UI components (ScreenHeader/Pill/SelectRow/SegmentedControl), Zod validators newPet/newAppointment; `pnpm typecheck` ✅, `pnpm lint` (0 warnings) ✅, `pnpm build` (web+iOS bundles OK))*