# API Documentación - Portal Cliente

> Documentación de la API REST para el portal cliente de VeteriApp. Esta documentación está diseñada para desarrolladores mobile que necesiten integrar sus aplicaciones con el sistema de gestión de clínicas veterinarias.

## Tabla de Contenidos
- [Información General](#información-general)
- [Autenticación](#autenticación)
  - [Iniciar Sesión](#post-apiv1authlogin)
  - [Cerrar Sesión](#post-apiv1authlogout)
  - [Verificar Sesión](#get-apiv1authsession)
  - [Recuperar Contraseña](#post-apiv1authforgot-password)
  - [Restablecer Contraseña](#post-apiv1authreset-password)
- [Mascotas](#mascotas)
  - [Listar Mascotas](#get-apiv1pets)
  - [Registrar Mascota](#post-apiv1pets)
  - [Detalle de Mascota](#get-apiv1petsid)
  - [Actualizar Mascota](#put-apiv1petsid)
- [Citas](#citas)
  - [Listar Citas](#get-apiv1appointments)
  - [Solicitar Cita](#post-apiv1appointments)
- [Configuración Pública](#configuración-pública)
  - [Obtener Horarios y Feriados](#get-apiv1publicsettings)
- [Categorías](#categorías)
  - [Listar Categorías](#get-apiv1categories)
- [Historial Médico](#historial-médico)
  - [Obtener Registros Médicos](#get-apiv1medical-records)
  - [Vacunas](#vacunas)
  - [Desparasitación](#desparasitación)
  - [Condiciones Crónicas](#condiciones-crónicas)
- [Perfil](#perfil)
  - [Ver Perfil](#get-apiv1profile)
  - [Actualizar Perfil](#put-apiv1profile)
  - [Cambiar Contraseña](#put-apiv1profilepassword)
- [Tipos de Datos](#tipos-de-datos)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Manejo de Errores](#manejo-de-errores)

---

## Información General

### URL Base
```
https://tu-dominio.com/api/v1
```

### Autenticación
La API utiliza autenticación basada en tokens JWT almacenados en cookies HttpOnly. Para las peticiones que lo requieren, el token se envía automáticamente mediante cookies.

### Formato de Respuesta
Todas las respuestas siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional de éxito"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error"
}
```

---

## Autenticación

### POST /api/v1/auth/login

Inicia sesión en el sistema con credenciales de usuario.

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "data": {
    "user": {
      "id": 123,
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "CLIENT"
    }
  }
}
```

**Errores:**
- `401`: Credenciales inválidas

---

### POST /api/v1/auth/logout

Cierra la sesión del usuario actual.

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente",
  "data": null
}
```

---

### GET /api/v1/auth/session

Verifica si existe una sesión activa y retorna los datos del usuario.

**Response (200) - Sesión activa:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "CLIENT"
  }
}
```

**Response (401) - Sin sesión:**
```json
{
  "success": false,
  "error": "No autorizado"
}
```

---

### POST /api/v1/auth/forgot-password

Solicita el envío de un correo para restablecer la contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Si el email está registrado, recibirás un enlace para restablecer tu contraseña",
  "data": null
}
```

---

### POST /api/v1/auth/reset-password

Restablece la contraseña usando un token válido recibido por email.

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NuevaPassword123"
}
```

**Validaciones de contraseña:**
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
  "data": null
}
```

---

## Mascotas

### GET /api/v1/pets

Obtiene la lista de mascotas registradas por el cliente autenticado.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Número de página (default: 1) |
| `limit` | number | Items por página (default: 10) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Firulais",
        "species": "Perro",
        "breed": "Labrador",
        "birthDate": "2020-05-15T00:00:00.000Z",
        "weight": 25.5,
        "sex": "MALE",
        "reproductiveStatus": "STERILIZED",
        "specialCharacteristics": "Alérgico al pollo",
        "microchipNumber": "900012345678901",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "owner": {
          "id": 123,
          "firstName": "Juan",
          "lastName": "Pérez",
          "email": "juan@email.com"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Campos de la mascota:**
| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| `id` | number | No | Identificador único |
| `name` | string | No | Nombre de la mascota |
| `species` | string | No | Especie (Perro, Gato, etc.) |
| `breed` | string | Sí | Raza |
| `birthDate` | string (ISO) | Sí | Fecha de nacimiento |
| `weight` | number | Sí | Peso en kg |
| `sex` | string | Sí | MALE o FEMALE |
| `reproductiveStatus` | string | Sí | FERTILE, STERILIZED, CASTRATED |
| `specialCharacteristics` | string | Sí | Características especiales |
| `microchipNumber` | string | Sí | Número de microchip |
| `createdAt` | string (ISO) | No | Fecha de registro |
| `owner` | object | No | Datos del propietario |

---

### POST /api/v1/pets

Registra una nueva mascota para el cliente autenticado.

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Luna",
  "species": "Gato",
  "breed": "Siames",
  "birthDate": "2022-03-10T00:00:00.000Z",
  "weight": 4.5,
  "sex": "FEMALE",
  "reproductiveStatus": "STERILIZED",
  "specialCharacteristics": "Tímida con extraños",
  "microchipNumber": "900098765432109"
}
```

**Campos requeridos:**
- `name`: string (min 1 carácter)
- `species`: string (min 1 carácter)

**Campos opcionales:**
- `breed`: string
- `birthDate`: string ISO 8601
- `weight`: number (positivo)
- `sex`: "MALE" | "FEMALE"
- `reproductiveStatus`: "FERTILE" | "STERILIZED" | "CASTRATED"
- `specialCharacteristics`: string
- `microchipNumber`: string

**Response (201):**
```json
{
  "success": true,
  "message": "Mascota creada exitosamente",
  "data": {
    "id": 2,
    "name": "Luna",
    "species": "Gato",
    "breed": "Siames",
    "birthDate": "2022-03-10T00:00:00.000Z",
    "weight": 4.5,
    "sex": "FEMALE",
    "reproductiveStatus": "STERILIZED",
    "specialCharacteristics": "Tímida con extraños",
    "microchipNumber": "900098765432109",
    "ownerId": 123,
    "createdAt": "2024-12-28T15:00:00.000Z"
  }
}
```

---

### GET /api/v1/pets/[id]

Obtiene el detalle de una mascota específica.

**Parámetros de URL:**
- `id`: ID de la mascota

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Firulais",
    "species": "Perro",
    "breed": "Labrador",
    "birthDate": "2020-05-15T00:00:00.000Z",
    "weight": 25.5,
    "sex": "MALE",
    "reproductiveStatus": "STERILIZED",
    "specialCharacteristics": "Alérgico al pollo",
    "microchipNumber": "900012345678901",
    "ownerId": 123,
    "owner": {
      "id": 123,
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com"
    },
    "medicalRecords": [
      {
        "id": 5,
        "title": "Consulta anual",
        "publicNotes": "Todo en orden",
        "createdAt": "2024-06-20T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `404`: Mascota no encontrada
- `403`: No tienes permiso para ver esta mascota

---

### PUT /api/v1/pets/[id]

Actualiza los datos de una mascota.

**Parámetros de URL:**
- `id`: ID de la mascota

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Firulais Jr",
  "weight": 28.0,
  "specialCharacteristics": "Actualizado: Alérgico al pollo y al maíz"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Mascota actualizada exitosamente",
  "data": {
    "id": 1,
    "name": "Firulais Jr",
    "weight": 28.0,
    ...
  }
}
```

---

## Citas

### GET /api/v1/appointments

Obtiene el historial de citas del cliente autenticado.

**Query Parameters:**
| Parámetro | Descripción |
|-----------|-------------|
| `status` | Filtrar por estado: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW |
| `petId` | Filtrar por mascota específica |
| `dateFrom` | Fecha inicio (ISO) |
| `dateTo` | Fecha fin (ISO) |
| `pendingOnly` | "true" para solo citas pendientes |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-12-20T10:00:00.000Z",
      "reason": "Consulta general",
      "status": "CONFIRMED",
      "notes": "Primera consulta de control",
      "petId": 1,
      "pet": {
        "id": 1,
        "name": "Firulais",
        "species": "Perro"
      },
      "category": {
        "id": "uuid-categoria",
        "name": "Consulta General",
        "color": "#4CAF50"
      },
      "vet": {
        "id": 5,
        "firstName": "María",
        "lastName": "García"
      },
      "createdAt": "2024-12-15T08:30:00.000Z"
    }
  ]
}
```

**Estados de cita:**
| Estado | Descripción |
|--------|-------------|
| `PENDING` | Pendiente de confirmación por el staff |
| `CONFIRMED` | Confirmada por el staff |
| `COMPLETED` | Cita atendida |
| `CANCELLED` | Cancelada |
| `NO_SHOW` | Cliente no asistió |

---

### POST /api/v1/appointments

Solicita una nueva cita. El cliente siempre crea citas con estado PENDING.

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-12-28T10:00:00.000Z",
  "reason": "Vacunación",
  "categoryId": "uuid-categoria",
  "petId": 1,
  "notes": "Requiere vacuna antirrábica"
}
```

**Campos requeridos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `date` | string (ISO) | Fecha y hora de la cita |
| `reason` | string | Motivo de la consulta |
| `categoryId` | string (UUID) | ID de la categoría |
| `petId` | number | ID de la mascota |

**Campos opcionales:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `notes` | string | Notas adicionales |

**Response (201):**
```json
{
  "success": true,
  "message": "Cita solicitada exitosamente. Recibirá un email cuando sea confirmada.",
  "data": {
    "id": 10,
    "date": "2024-12-28T10:00:00.000Z",
    "reason": "Vacunación",
    "status": "PENDING",
    "petId": 1,
    "pet": { ... },
    "category": { ... },
    "createdAt": "2024-12-28T09:00:00.000Z"
  }
}
```

**Validaciones:**
- La fecha no puede ser en el pasado
- La fecha debe estar dentro del horario de atención
- La fecha no puede ser un día festivo
- El cliente solo puede agendar para sus propias mascotas

---

## Configuración Pública

### GET /api/v1/public/settings

Obtiene horarios de atención y días festivos. No requiere autenticación.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "monday": { "enabled": true, "open": "08:00", "close": "20:00" },
      "tuesday": { "enabled": true, "open": "08:00", "close": "20:00" },
      "wednesday": { "enabled": true, "open": "08:00", "close": "20:00" },
      "thursday": { "enabled": true, "open": "08:00", "close": "20:00" },
      "friday": { "enabled": true, "open": "08:00", "close": "20:00" },
      "saturday": { "enabled": true, "open": "09:00", "close": "14:00" },
      "sunday": { "enabled": false, "open": "00:00", "close": "00:00" }
    },
    "upcomingHolidays": [
      {
        "id": 1,
        "date": "2025-01-01T00:00:00.000Z",
        "label": "Año Nuevo"
      }
    ]
  }
}
```

**Uso en móvil:**
Esta información es útil para validar localmente que la fecha seleccionada esté dentro del horario de atención y no sea un día festivo, antes de enviar la solicitud de cita.

---

## Categorías

### GET /api/v1/categories

Obtiene las categorías disponibles para las citas.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-categoria-1",
      "name": "Consulta General",
      "color": "#4CAF50"
    },
    {
      "id": "uuid-categoria-2",
      "name": "Vacunación",
      "color": "#2196F3"
    },
    {
      "id": "uuid-categoria-3",
      "name": "Cirugía",
      "color": "#F44336"
    },
    {
      "id": "uuid-categoria-4",
      "name": "Emergencia",
      "color": "#FF9800"
    },
    {
      "id": "uuid-categoria-5",
      "name": "Laboratorio",
      "color": "#9C27B0"
    }
  ]
}
```

---

## Historial Médico

### GET /api/v1/medical-records

Obtiene los registros médicos de las mascotas del cliente.

**Query Parameters:**
| Parámetro | Descripción |
|-----------|-------------|
| `petId` | ID de la mascota (requerido) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-12-15T10:00:00.000Z",
      "title": "Consulta de control",
      "diagnosis": "Salud general buena",
      "treatment": "Continuar con alimentación actual",
      "publicNotes": "El paciente presenta buen estado de ánimo",
      "pet": {
        "id": 1,
        "name": "Firulais",
        "species": "Perro"
      },
      "vet": {
        "id": 5,
        "firstName": "María",
        "lastName": "García"
      },
      "vitals": {
        "weight": 25.5,
        "temperature": 38.5,
        "heartRate": 120,
        "respiratoryRate": 25
      },
      "createdAt": "2024-12-15T10:30:00.000Z"
    }
  ]
}
```

**Signos vitales (vitals):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `weight` | number | Peso en kg |
| `temperature` | number | Temperatura en °C |
| `heartRate` | number | Frecuencia cardíaca (lpm) |
| `respiratoryRate` | number | Frecuencia respiratoria (rpm) |

---

### Vacunas

### GET /api/v1/pets/[id]/vaccinations

Obtiene el historial de vacunas de una mascota.

**Parámetros de URL:**
- `id`: ID de la mascota

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vaccineName": "Séxtuple",
      "vaccineType": " viral",
      "administrationDate": "2024-06-15T00:00:00.000Z",
      "nextDoseDate": "2025-06-15T00:00:00.000Z",
      "lotNumber": "LOT2024001",
      "manufacturer": "Zoetis",
      "veterinarian": "Dra. María García",
      "petId": 1,
      "createdAt": "2024-06-15T11:00:00.000Z"
    }
  ]
}
```

---

### Desparasitación

### GET /api/v1/pets/[id]/deworming

Obtiene el historial de desparasitaciones de una mascota.

**Parámetros de URL:**
- `id`: ID de la mascota

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productName": "Drontal Plus",
      "type": "INTERNAL",
      "dosage": "1 tableta",
      "date": "2024-09-01T00:00:00.000Z",
      "nextDate": "2024-12-01T00:00:00.000Z",
      "petId": 1,
      "createdAt": "2024-09-01T09:00:00.000Z"
    }
  ]
}
```

**Tipos de desparasitación:**
| Tipo | Descripción |
|------|-------------|
| `INTERNAL` | Interno (gusanos internos) |
| `EXTERNAL` | Externo (pulgas, garrapatas) |
| `BOTH` | Ambos |

---

### Condiciones Crónicas

### GET /api/v1/pets/[id]/chronic-conditions

Obtiene las alergias y condiciones crónicas de una mascota.

**Parámetros de URL:**
- `id`: ID de la mascota

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": " Dermatitis atópica",
      "type": "ALERGIA",
      "severity": "MODERATE",
      "diagnosisDate": "2023-05-10T00:00:00.000Z",
      "notes": "Requierer baños con shampoo medicado",
      "isActive": true,
      "petId": 1,
      "createdAt": "2023-05-10T14:00:00.000Z"
    }
  ]
}
```

---

## Perfil

### GET /api/v1/profile

Obtiene los datos del perfil del usuario autenticado.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "CLIENT",
    "rut": "12.345.678-9",
    "phone": "+56 9 1234 5678",
    "address": "Av. Principal 123",
    "regionId": "region-uuid",
    "comunaId": "comuna-uuid",
    "createdAt": "2023-01-15T10:00:00.000Z",
    "updatedAt": "2024-12-01T08:00:00.000Z",
    "region": {
      "id": "region-uuid",
      "name": "Metropolitana",
      "code": "RM"
    },
    "comuna": {
      "id": "comuna-uuid",
      "name": "Santiago",
      "code": "SCL",
      "regionId": "region-uuid"
    }
  }
}
```

---

### PUT /api/v1/profile

Actualiza los datos del perfil del usuario.

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "email": "nuevo@ejemplo.com",
  "phone": "+56 9 9876 5432",
  "address": "Nueva Dirección 456",
  "regionId": "region-uuid",
  "comunaId": "comuna-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": { ... }
}
```

**Validaciones:**
- Email debe ser válido y único
- Teléfono máximo 30 caracteres
- Dirección máximo 255 caracteres

---

### PUT /api/v1/profile/password

Cambia la contraseña del usuario.

**Cabeceras:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "PasswordActual123",
  "newPassword": "NuevaPassword456"
}
```

**Validaciones de nueva contraseña:**
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número
- Debe ser diferente a la contraseña actual

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": null
}
```

**Errores:**
- `400`: La contraseña actual es incorrecta
- `400`: La nueva contraseña debe ser diferente a la actual

---

## Tipos de Datos

### Enum Role
```typescript
"ADMIN" | "VET" | "RECEPTIONIST" | "CLIENT"
```

### Enum Sex
```typescript
"MALE" | "FEMALE"
```

### Enum ReproductiveStatus
```typescript
"FERTILE" | "STERILIZED" | "CASTRATED"
```

### Enum AppointmentStatus
```typescript
"PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
```

### Enum DewormingType
```typescript
"INTERNAL" | "EXTERNAL" | "BOTH"
```

### Formato de Fechas
Todas las fechas se envían en formato ISO 8601:
```
2024-12-28T10:00:00.000Z
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Manejo de Errores

### Error de Validación (400)
```json
{
  "success": false,
  "error": "email: Email inválido"
}
```

### Error de Autenticación (401)
```json
{
  "success": false,
  "error": "No autorizado"
}
```

### Error de Permisos (403)
```json
{
  "success": false,
  "error": "Acceso prohibido"
}
```

### Error de Recurso No Encontrado (404)
```json
{
  "success": false,
  "error": "Mascota no encontrada"
}
```

### Error Genérico (500)
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

---

## Recomendaciones para Desarrollo Mobile

### Manejo de Sesión
1. Al iniciar sesión, el token JWT se almacena automáticamente en cookies
2. Para verificar la sesión, llama a `GET /api/v1/auth/session`
3. Si la respuesta es 401, redirige al usuario a la pantalla de login

### Optimización de Solicitudes
1. **Listas con paginación**: Usa `page` y `limit` para paginar resultados
2. **Caché local**: Guarda los horarios de atención (`/api/v1/public/settings`) localmente
3. **Carga diferida**: Carga los detalles de historial médico solo cuando el usuario los requiera

### Validación Local (antes de enviar)
Antes de solicitar una cita, valida localmente usando `/api/v1/public/settings`:
- La fecha no puede ser en el pasado
- La fecha debe estar dentro del horario de atención
- La fecha no puede ser un día festivo

### Sincronización Offline
Para funcionalidad offline:
1. Guarda los datos de mascotas localmente
2. Cuando recuperes conexión, sincroniza con el servidor
3. Maneja conflictos dando prioridad a los datos del servidor

---

**Versión de la API:** 1.0
**Última actualización:** 2024-12-28