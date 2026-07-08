export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | { [k: string]: boolean | null | undefined };

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value && value !== 0) return;
    if (typeof value === 'string' || typeof value === 'number') {
      result.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if (value[key]) result.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return result.join(' ');
}
