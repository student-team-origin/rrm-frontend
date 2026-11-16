import type { EventInput } from '@fullcalendar/core';
import { reservationStatusColors, reservationStatusLabels } from '../../../theme';
import type { ReservationStatus } from '../../reservations/types';
import type { OccupiedInterval } from '../types';

/**
 * Stările în care o rezervare ocupă resursa: aceleași ca în constrângerea de suprapunere din baza
 * de date. Doar acestea apar în calendar.
 */
export const OCCUPYING_STATUSES: readonly ReservationStatus[] = [
  'InAsteptareCoordonator',
  'InAsteptareLaborator',
  'Aprobata',
  'Activa',
];

/**
 * Transformă intervalele ocupate în evenimente FullCalendar, colorate după starea rezervării cu
 * culorile din `theme.ts`. Intervalele incomplete (fără start, sfârșit sau stare) se ignoră.
 *
 * @param getContrastText culoarea textului lizibil pe fundalul dat (din paleta temei)
 */
export function toCalendarEvents(
  intervals: readonly OccupiedInterval[],
  getContrastText: (background: string) => string,
): EventInput[] {
  return intervals.flatMap(({ start, sfarsit, stare }, index) => {
    if (!start || !sfarsit || !stare) {
      return [];
    }
    const color = reservationStatusColors[stare];
    return [
      {
        id: `${index}-${start}`,
        title: reservationStatusLabels[stare],
        start,
        end: sfarsit,
        backgroundColor: color,
        borderColor: color,
        textColor: getContrastText(color),
      },
    ];
  });
}
