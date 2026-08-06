# Implementation Plan — Mockup Screen Design Adjustments

This plan outlines the visual redesign and enhancement of several mobile application screens in **VeteriApp-mobile** to match the branding, typography, color schemes, and layouts provided in the `mockup` folder images (`login.png`, `mis_mascotas.png`, `Mis_citas.png`, `Agendar_cita.png`, `agendar_cita_form.png`, and `Historial_medica.png`).

---

## User Review Required

> [!IMPORTANT]
> The mockup images represent a web/desktop design structure (including top navigation tabs and header bars). Since this is a native Expo mobile application, we will retain the mobile app's native layout (e.g., bottom navigation bar and stack routing) but style all component elements (cards, headers, tags, forms, buttons, checkmarks, etc.) to mirror the exact colors, margins, input shapes, and tabbed sub-sections shown in the mockups.
>
> In the **Historial Médico** section (`Historial_medica.png`), we are going to merge the sub-pages (vaccinations, deworming, chronic conditions) into a unified tabbed layout on the main screen of each pet's medical record, rather than forcing the user to navigate to separate pages. This matches the mockup's interactive tab design.

---

## Proposed Changes

### 1. Typography & Global Styles

- Keep utilizing the Outfit font configurations defined in `tailwind.config.js`.
- Confirm all button and input element borders and shadows align with the design specifications (`ESQUEMA_COLORES.md`).

---

### 2. General Input & Form Redesign

#### [MODIFY] [Input.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/components/ui/Input.tsx)
- Add a red asterisk (`*`) to the label if the input is marked as `required`.
- Add local state to toggle password visibility (eye/eye-off icon from `lucide-react-native`) when `secureTextEntry` is passed.
- Add right padding to the text input field when it has password toggle to avoid overlap.

---

### 3. Authentication Redesign

#### [MODIFY] [login.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/app/(auth)/login.tsx)
- Reorganize header hierarchy to match `login.png`: display only the logo at the top (with its embedded text) and center the "Iniciar Sesión" title and subtitle "Ingresa tus credenciales para acceder al sistema" below it.
- Add a footer showing `"v1.0.0"` and `"coprigth HidalgoWeb"` centered at the bottom of the screen.

#### [MODIFY] [LoginForm.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/components/forms/LoginForm.tsx)
- Move the "¿Olvidaste tu contraseña?" link to align on the right directly below the password input field.
- Set placeholders to `"correo@ejemplo.com"` and `"Ingresa tu contraseña"`.
- Mark both inputs as `required`.

#### [MODIFY] [RegisterForm.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/components/forms/RegisterForm.tsx)
- Mark the required inputs as `required` to render the red asterisk correctly.

---

### 4. Pets Screen Redesign

#### [MODIFY] [formatDate.ts](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/lib/formatDate.ts)
- Add a `calculateAge` helper function using `date-fns` to format the pet's age dynamically as `"X años Y meses"`.
- Add a `formatFullDateTime` helper function to return dates formatted as `"lunes, 10 de agosto de 2026, 9:30"`.

#### [MODIFY] [PetCard.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/components/lists/PetCard.tsx)
- Implement an `isActive` (active/selected) prop. When true, card background becomes `bg-brand-50`, border becomes `border-brand-200`, and a purple status indicator dot is rendered on the right.
- Color the species badge based on its value: blue/brand for Perro, and purple/pink for Gato.
- Render the uppercase breed name next to the species.
- Call the `calculateAge` utility to format the age string.

#### [MODIFY] [index.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/app/(tabs)/pets/index.tsx)
- Pass `isActive={index === 0}` (or matching active state) to show the selection indicator.
- Set header subtitle to `"Toca una mascota para ver su detalle."` or `"Visualiza y gestiona las mascotas registradas en tu cuenta."`.

---

### 5. Appointments Redesign

#### [MODIFY] [AppointmentRow.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/src/components/lists/AppointmentRow.tsx)
- Render the checkmark status icon on the left (a green box containing a white check icon for CONFIRMED status).
- Render a dynamic color category badge next to the pet name.
- Format the appointment date using `formatFullDateTime`.
- Nest the reason and notes inside a light gray/blue container at the bottom of the card.

---

### 6. Medical Records (Historial Médico) Tabbed Layout

#### [MODIFY] [index.tsx](file:///home/haleymhm/Projects/repositories-git/VeteriApp-mobile/app/medical-records/[petId]/index.tsx)
- Refactor to display the selector showing the pet name and species, along with the **Descargar PDF** button styled with a file icon and green background (`bg-success-500` / `#12b76a`).
- Render a pet card summarizing the active pet matching `Historial_medica.png` details (light-blue bg, pet avatar, purple name/species/breed text).
- Replace navigation list items with tabbed sub-headers ("Consultas", "Vacunas", "Desparasitación", "Alergias/Patologías").
- Render tab contents dynamically depending on the selected tab:
  - **Consultas**: Display the list of consultation cards. If vitals are present, render a vitals status box displaying weight, temperature, heart rate (FC), and respiratory rate (FR) inline.
  - **Vacunas**: Fetch and render vaccination cards directly.
  - **Desparasitación**: Fetch and render deworming records.
  - **Alergias/Patologías**: Fetch and render chronic condition cards.
- Implement the "Descargar PDF" function, showing a mock progress alert and download success.

---

## Verification Plan

### Automated Tests
- Since Jest is configured, if npm environment tools are available in the shell, we can verify tests using standard test commands.

### Manual Verification
- Deploy/run the Expo development server locally.
- Inspect the visual output of the modified pages:
  1. Login page: centering, logo size, placeholders, red asterisks, password visibility eye toggle, and copyright footer.
  2. Pets list: species badge colors, age format, and selected pet highlight.
  3. Appointments list: checkmark icon, category badge, full locale date format, and reason section container.
  4. Medical records: pet selector button, download PDF button, pet summary card, tab navigation switcher, inline vitals section, and sub-content lists.
