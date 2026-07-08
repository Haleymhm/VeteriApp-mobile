import { z } from 'zod';

const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]$/;

export const optionalRutSchema = z
  .string()
  .trim()
  .max(12)
  .refine((v) => v === '' || rutRegex.test(v), {
    message: 'RUT inválido',
  })
  .optional();
