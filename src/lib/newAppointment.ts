import { z } from 'zod';

export const newAppointmentSchema = z.object({
  petId: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .pipe(
      z
        .number({ message: 'Selecciona una mascota' })
        .int('Selecciona una mascota')
        .positive('Selecciona una mascota'),
    ),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  reason: z
    .string()
    .trim()
    .min(1, 'Indica el motivo de la cita')
    .max(200, 'Máximo 200 caracteres'),
  date: z
    .string()
    .min(1, 'Selecciona una fecha')
    .refine((iso) => {
      const parsed = new Date(iso);
      return !Number.isNaN(parsed.getTime());
    }, 'Fecha inválida')
    .refine((iso) => new Date(iso).getTime() > Date.now(), {
      message: 'La fecha no puede ser en el pasado',
    }),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export type NewAppointmentFormValues = z.infer<typeof newAppointmentSchema>;
