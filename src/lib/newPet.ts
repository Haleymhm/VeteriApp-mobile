import { z } from 'zod';

export const newPetSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido').max(80),
  species: z.string().trim().min(1, 'Especie requerida').max(60),
  breed: z.string().trim().max(80).optional().or(z.literal('')),
  birthDate: z.string().trim().optional().or(z.literal('')),
  weight: z
    .union([z.string().trim(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === '' || v === null) return undefined;
      const n = typeof v === 'string' ? Number(v) : v;
      return Number.isFinite(n) && n > 0 ? Number(n) : undefined;
    }),
  sex: z.enum(['MALE', 'FEMALE']).optional().or(z.literal('')),
  reproductiveStatus: z
    .enum(['FERTILE', 'STERILIZED', 'CASTRATED'])
    .optional()
    .or(z.literal('')),
  specialCharacteristics: z.string().trim().max(500).optional().or(z.literal('')),
  microchipNumber: z.string().trim().max(40).optional().or(z.literal('')),
});

export type NewPetFormValues = z.infer<typeof newPetSchema>;
