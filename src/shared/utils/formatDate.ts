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
