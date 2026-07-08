import { useState } from 'react';
import { ZodError, type ZodSchema } from 'zod';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface UseZodFormResult<T> {
  values: Partial<T>;
  errors: FieldErrors<T>;
  generalError: string | null;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  handleSubmit: (
    handler: (values: T) => Promise<void> | void,
  ) => () => Promise<void>;
  reset: () => void;
}

export function useZodForm<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  initial: Partial<T> = {},
): UseZodFormResult<T> {
  const [values, setValues] = useState<Partial<T>>(initial);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setValue<K extends keyof T>(field: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError(null);
  }

  function reset() {
    setValues(initial);
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(false);
  }

  function handleSubmit(handler: (values: T) => Promise<void> | void) {
    return async () => {
      setGeneralError(null);
      const result = schema.safeParse(values);
      if (!result.success) {
        const zodError = result.error as ZodError;
        const fieldErrors: FieldErrors<T> = {};
        for (const issue of zodError.issues) {
          const key = issue.path?.[0];
          if (typeof key === 'string' || typeof key === 'number') {
            const k = key as keyof T;
            if (!fieldErrors[k]) fieldErrors[k] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }
      setIsSubmitting(true);
      try {
        await handler(result.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Algo salió mal';
        setGeneralError(message);
      } finally {
        setIsSubmitting(false);
      }
    };
  }

  return {
    values,
    errors,
    generalError,
    isSubmitting,
    setValue,
    handleSubmit,
    reset,
  };
}
