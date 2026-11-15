import dayjs from 'dayjs';
import 'dayjs/locale/ro';

dayjs.locale('ro');

/** Formatează o dată ISO ca „12 nov. 2026”. */
export function formatDate(value: string | Date): string {
  return dayjs(value).format('D MMM YYYY');
}

/** Formatează o dată ISO ca „12 nov. 2026, 14:30”. */
export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('D MMM YYYY, HH:mm');
}

/**
 * Formatează un interval: „12 nov. 2026, 10:00–12:00” în aceeași zi, altfel
 * „12 nov. 2026, 22:00 – 13 nov. 2026, 02:00”.
 */
export function formatDateTimeRange(start: string | Date, end: string | Date): string {
  if (dayjs(start).isSame(end, 'day')) {
    return `${formatDateTime(start)}–${dayjs(end).format('HH:mm')}`;
  }
  return `${formatDateTime(start)} – ${formatDateTime(end)}`;
}
