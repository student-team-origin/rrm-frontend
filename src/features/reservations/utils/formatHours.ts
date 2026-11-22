import dayjs from 'dayjs';

const HOURS_FORMAT = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });

/** Un număr de ore, ca „42 h” sau „1,5 h”. */
export function formatHours(hours: number): string {
  return `${HOURS_FORMAT.format(hours)} h`;
}

/** Durata în ore dintre două valori `datetime-local`, sau `undefined` dacă nu e un interval valid. */
export function durationHours(start: string, end: string): number | undefined {
  const minutes = dayjs(end).diff(dayjs(start), 'minute');
  return Number.isNaN(minutes) || minutes <= 0 ? undefined : minutes / 60;
}
