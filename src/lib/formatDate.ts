import { format, formatDistanceToNow, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentStatus } from '@/types';

export function formatDate(iso: string | Date, pattern = 'dd MMM yyyy'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return format(date, pattern, { locale: es });
}

export function formatDateTime(iso: string | Date): string {
  return formatDate(iso, "dd MMM yyyy · HH:mm 'hrs'");
}

export function formatTime(iso: string | Date): string {
  return formatDate(iso, 'HH:mm');
}

export function fromNow(iso: string | Date): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function isFuture(iso: string | Date): boolean {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return isAfter(date, new Date());
}

export interface StatusBadgeInfo {
  label: string;
  bg: string;
  text: string;
}

const STATUS_MAP: Record<AppointmentStatus, StatusBadgeInfo> = {
  PENDING: { label: 'Pendiente', bg: 'bg-warning/15', text: 'text-warning' },
  CONFIRMED: { label: 'Confirmada', bg: 'bg-success/15', text: 'text-success' },
  COMPLETED: { label: 'Completada', bg: 'bg-primary/15', text: 'text-primary' },
  CANCELLED: { label: 'Cancelada', bg: 'bg-danger/15', text: 'text-danger' },
  NO_SHOW: { label: 'No asistió', bg: 'bg-gray-200', text: 'text-gray-500' },
};

export function getAppointmentStatus(status: AppointmentStatus): StatusBadgeInfo {
  return STATUS_MAP[status];
}
