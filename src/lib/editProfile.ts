import { z } from 'zod';

export const editProfileSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().trim().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),
  address: z.string().trim().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  rut: z.string().trim().max(12).optional().or(z.literal('')),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
