import type { EventInput } from '@fullcalendar/core';
import { alpha, type Theme } from '@mui/material/styles';
import dayjs from 'dayjs';
import {
  reservationStatusColors,
  reservationStatusLabels,
  resourceStatusColors,
  resourceStatusLabels,
} from '../../../theme';
import type { ReservationStatus } from '../../reservations/types';
import type { AvailabilityRange, OccupiedInterval, ResourceStatus } from '../types';

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

/** Cererile încă neaprobate: în calendar au chenar punctat și fundal deschis. */
export const PENDING_STATUSES: readonly ReservationStatus[] = [
  'InAsteptareCoordonator',
  'InAsteptareLaborator',
];

/** Clasele CSS ale evenimentelor, stilizate în `AvailabilityCalendar` și în legendă. */
export const EVENT_CLASS = {
  pending: 'rrm-event-pending',
  buffer: 'rrm-event-buffer',
} as const;

/** Tipul evenimentului, în `extendedProps.kind`. */
export type CalendarEventKind = 'reservation' | 'buffer' | 'unavailable';

/** Eticheta timpului de pregătire de după o rezervare. */
export const BUFFER_LABEL = 'Pregătire';

/** Culorile evenimentelor, calculate din paleta temei. */
export type EventColors = {
  /** Culoarea textului lizibil pe fundalul dat. */
  getContrastText: (background: string) => string;
  /** Varianta foarte deschisă a culorii, pentru fundalul cererilor în așteptare. */
  tint: (color: string) => string;
  /** Culoarea textului pe un fundal deschis. */
  text: string;
};

/** Opacitatea fundalului cererilor în așteptare. */
const PENDING_TINT_OPACITY = 0.12;

/** Culorile evenimentelor din paleta temei; aceleași în calendar și în legendă. */
export function eventColors(theme: Theme): EventColors {
  return {
    getContrastText: (background) => theme.palette.getContrastText(background),
    tint: (color) => alpha(color, PENDING_TINT_OPACITY),
    text: theme.palette.text.primary,
  };
}

/**
 * Transformă intervalele ocupate în evenimente FullCalendar, colorate după starea rezervării cu
 * culorile din `theme.ts`. Ultimele `preparationMinutes` din fiecare interval devin un eveniment
 * separat, „Pregătire”, ca să se vadă cât durează rezervarea propriu-zisă. Intervalele incomplete
 * (fără start, sfârșit sau stare) se ignoră.
 *
 * @param preparationMinutes timpul de pregătire actual al resursei; `sfarsit` din API include
 *     timpul de pregătire de la crearea rezervării, deci dacă acesta s-a schimbat între timp,
 *     separarea e aproximativă (intervalul ocupat în total rămâne exact)
 */
export function toCalendarEvents(
  intervals: readonly OccupiedInterval[],
  preparationMinutes: number,
  colors: EventColors,
): EventInput[] {
  return intervals.flatMap(({ start, sfarsit, stare }, index) => {
    if (!start || !sfarsit || !stare) {
      return [];
    }
    const id = `${index}-${start}`;
    const color = reservationStatusColors[stare];
    const pending = PENDING_STATUSES.includes(stare);
    const bufferStart = dayjs(sfarsit).subtract(preparationMinutes, 'minute');
    const hasBuffer = preparationMinutes > 0 && bufferStart.isAfter(start);
    const reservationEnd = hasBuffer ? bufferStart.toISOString() : sfarsit;

    const events: EventInput[] = [
      {
        id,
        title: reservationStatusLabels[stare],
        start,
        end: reservationEnd,
        backgroundColor: pending ? colors.tint(color) : color,
        borderColor: color,
        textColor: pending ? colors.text : colors.getContrastText(color),
        classNames: pending ? [EVENT_CLASS.pending] : [],
        extendedProps: { kind: 'reservation' satisfies CalendarEventKind },
      },
    ];
    if (hasBuffer) {
      events.push({
        id: `${id}-pregatire`,
        title: BUFFER_LABEL,
        start: reservationEnd,
        end: sfarsit,
        classNames: [EVENT_CLASS.buffer],
        extendedProps: { kind: 'buffer' satisfies CalendarEventKind },
      });
    }
    return events;
  });
}

/**
 * O resursă în mentenanță sau defectă nu poate fi rezervată: perioada afișată, de acum înainte,
 * apare ca fundal în culoarea stării resursei. Pentru o resursă activă nu întoarce nimic.
 */
export function toUnavailableEvents(
  status: ResourceStatus | undefined,
  range: AvailabilityRange | undefined,
  now: Date,
): EventInput[] {
  if (!status || status === 'Activa' || !range) {
    return [];
  }
  const start = dayjs(range.from).isAfter(now) ? dayjs(range.from) : dayjs(now);
  if (!start.isBefore(range.to)) {
    return [];
  }
  return [
    {
      id: 'resursa-indisponibila',
      title: resourceStatusLabels[status],
      start: start.toISOString(),
      end: range.to,
      display: 'background',
      backgroundColor: resourceStatusColors[status],
      extendedProps: { kind: 'unavailable' satisfies CalendarEventKind },
    },
  ];
}

/** Orele afișate implicit în vizualizarea pe zi și pe săptămână (program de lucru). */
export const WORKING_HOURS = { start: 8, end: 18 } as const;

/** Intervalul orar afișat de grila pe zi/săptămână (`slotMinTime` / `slotMaxTime`). */
export type VisibleHours = { slotMinTime: string; slotMaxTime: string };

const toSlotTime = (hour: number) => `${String(hour).padStart(2, '0')}:00:00`;

/**
 * Orele afișate: programul de lucru (08:00–18:00), extins cât să încapă toate intervalele ocupate,
 * ca o rezervare de seară sau de noapte să nu fie ascunsă. Un interval care trece peste miezul
 * nopții afișează ziua întreagă.
 */
export function visibleHours(intervals: readonly OccupiedInterval[]): VisibleHours {
  let startHour: number = WORKING_HOURS.start;
  let endHour: number = WORKING_HOURS.end;
  for (const { start, sfarsit } of intervals) {
    if (!start || !sfarsit) {
      continue;
    }
    const from = dayjs(start);
    const to = dayjs(sfarsit);
    const endsAtMidnight = to.isSame(from.add(1, 'day'), 'day') && to.isSame(to.startOf('day'));
    if (!to.isSame(from, 'day') && !endsAtMidnight) {
      return { slotMinTime: toSlotTime(0), slotMaxTime: toSlotTime(24) };
    }
    startHour = Math.min(startHour, from.hour());
    endHour = Math.max(endHour, endsAtMidnight ? 24 : Math.ceil(to.hour() + to.minute() / 60));
  }
  return { slotMinTime: toSlotTime(startHour), slotMaxTime: toSlotTime(endHour) };
}
