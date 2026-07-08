# Plan Maestro: App Móvil - Portal del Cliente VeteriApp

> **Versión:** 2.1.0
> **Fecha:** 2026-07-08
> **Stack:** React Native + Expo (SDK 57) | API REST (Portal Client API v1)
> **Repositorio único:** `veteriApp-mobile`
> **Gestor de paquetes:** pnpm

---

## 1. Visión General

Crear una **app móvil nativa** (iOS/Android) que funcione como el **Portal del Cliente** de VeteriApp, permitiendo a los dueños de mascotas gestionar sus citas, ver el historial médico de sus mascotas y editar su perfil desde cualquier lugar.

### 1.1 Objetivos

| Objetivo | Descripción |
|----------|-------------|
| **NX-01** | App nativa para iOS y Android usando Expo (última versión) |
| **NX-02** | Consumir la API REST documentada en `PORTAL_CLIENT_API.md` sin modificar la lógica de negocio |
| **NX-03** | Mantener el backend (Next.js) intacto y sin cambios en su estructura |
| **NX-04** | Soportar autenticación via JWT Bearer Token |
| **NX-05** | Preparar la infraestructura para notificaciones push |
| **NX-06** | Repositorio único para la app móvil |

---

## 2. Arquitectura

### 2.1 Estructura del Proyecto (Repo Único)

```
veteriApp-mobile/
├── app/                        # Expo Router (navegación basada en archivos)
│   ├── (auth)/
│   │   ├── _layout.tsx         # Auth stack layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                 # Bottom tabs (native-bottom-tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home / Dashboard
│   │   ├── pets/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Lista de mascotas
│   │   │   └── [id].tsx        # Detalle de mascota
│   │   ├── appointments/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Lista de citas
│   │   │   ├── new.tsx         # Nueva cita
│   │   │   └── [id].tsx         # Detalle de cita
│   │   └── profile/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── edit.tsx
│   │       └── change-password.tsx
│   │
│   ├── medical-records/
│   │   ├── [petId].tsx         # Historial médico de una mascota
│   │   ├── vaccinations.tsx     # Vacunas
│   │   ├── deworming.tsx       # Desparasitación
│   │   └── chronic-conditions.tsx
│   │
│   ├── +html.tsx               # Web fallback
│   ├── +not-found.tsx
│   └── _layout.tsx              # Root layout
│
├── src/
│   ├── api/                    # Cliente Axios y endpoints
│   │   ├── client.ts           # Instancia de Axios configurada
│   │   ├── auth.ts            # Endpoints de autenticación
│   │   ├── pets.ts            # Endpoints de mascotas
│   │   ├── appointments.ts    # Endpoints de citas
│   │   ├── medical-records.ts # Endpoints de historial médico
│   │   ├── profile.ts         # Endpoints de perfil
│   │   └── public.ts          # Endpoints públicos (settings, categorías)
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/                # Componentes base (Button, Input, Card, etc.)
│   │   ├── forms/             # Formularios (LoginForm, RegisterForm, etc.)
│   │   ├── lists/             # Componentes de lista (PetListItem, AppointmentCard, etc.)
│   │   └── feedback/           # Loading, Error, Empty states
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePets.ts
│   │   ├── useAppointments.ts
│   │   └── usePublicSettings.ts
│   │
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── lib/                    # Utilidades
│   │   ├── storage.ts          # expo-secure-store wrapper
│   │   ├── validators.ts       # Zod schemas
│   │   └── utils.ts
│   │
│   └── types/                  # Tipos TypeScript
│       ├── api.ts             # Response types basados en API docs
│       ├── auth.ts
│       ├── pet.ts
│       ├── appointment.ts
│       └── index.ts
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
| `/api/v1/auth/login` | POST | Iniciar sesión (retorna JWT token) |
| `/api/v1/auth/logout` | POST | Cerrar sesión |
| `/api/v1/auth/session` | GET | Verificar sesión activa |
| `/api/v1/auth/forgot-password` | POST | Solicitar recuperación de contraseña |
| `/api/v1/auth/reset-password` | POST | Restablecer contraseña con token |

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

**Tareas:**
- [ ] Crear proyecto Expo con TypeScript
- [ ] Configurar NativeWind y tema
- [ ] Implementar API client con Axios (interceptor Bearer Token)
- [ ] Implementar storage seguro para token
- [ ] Implementar `LoginScreen`
- [ ] Implementar `RegisterScreen`
- [ ] Implementar `ForgotPasswordScreen`
- [ ] Implementar auth store con Zustand
- [ ] Proteger rutas (redirect si no hay token)
- [ ] **Commit:** `(feat) Fase 1: Proyecto base y autenticación`

### Fase 2: Navegación y Dashboard
**Objetivo:** Implementar navegación tabs y home.

**Tareas:**
- [ ] Configurar Expo Router con native-bottom-tabs
- [ ] Implementar `HomeScreen` (dashboard con próximas citas)
- [ ] Implementar `ProfileScreen`
- [ ] Implementar `EditProfileScreen`
- [ ] Implementar `ChangePasswordScreen`
- [ ] **Commit:** `(feat) Fase 2: Navegación y Dashboard`

### Fase 3: Mascotas y Citas
**Objetivo:** Implementar módulos de mascotas y citas.

**Tareas:**
- [ ] Implementar `PetsListScreen` con FlashList
- [ ] Implementar `PetDetailScreen`
- [ ] Implementar `AppointmentsListScreen`
- [ ] Implementar `NewAppointmentScreen`
- [ ] Implementar `AppointmentDetailScreen`
- [ ] **Commit:** `(feat) Fase 3: Mascotas y Citas`

### Fase 4: Historial Médico
**Objetivo:** Completar funcionalidades del portal.

**Tareas:**
- [ ] Implementar vista de historial médico
- [ ] Implementar vista de vacunas
- [ ] Implementar vista de desparasitación
- [ ] Implementar vista de condiciones crónicas
- [ ] **Commit:** `(feat) Fase 4: Historial Médico`

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

*Documento actualizado el 2026-07-08 (v2.1.0 — alineado a Expo SDK 57 y AGENTS.md)*