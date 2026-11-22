import dayjs from 'dayjs';
import { getHttpStatus, toApiError } from '../../../api/client';
import type { FreeInterval } from '../types';

/** Un interval liber propus la 409, cu ambele capete. */
export type FreeSlot = Required<FreeInterval>;

/** Eroarea la trimiterea unei cereri de rezervare, pregătită pentru afișare. */
export type CreateReservationError =
  /** 409: intervalul e ocupat; `freeIntervals` lipsește dacă backend-ul nu le-a putut calcula. */
  | { kind: 'conflict'; message: string; freeIntervals?: FreeSlot[] }
  /** 422: sold de ore insuficient pe grant sau resursă indisponibilă. */
  | { kind: 'businessRule'; message: string }
  | { kind: 'other'; message: string };

/** Mesajul afișat la 409, deasupra intervalelor libere. */
export const CONFLICT_MESSAGE = 'Intervalul ales se suprapune cu o altă rezervare.';

/** Clasifică eroarea primită la `POST /reservations` (409 și 422 au mesaje dedicate). */
export function toCreateReservationError(error: unknown): CreateReservationError {
  const status = getHttpStatus(error);
  const body = toApiError(error);
  if (status === 409) {
    return { kind: 'conflict', message: CONFLICT_MESSAGE, freeIntervals: readFreeIntervals(body) };
  }
  if (status === 422) {
    return { kind: 'businessRule', message: body.message };
  }
  return { kind: 'other', message: body.message };
}

/** Intervalele libere din corpul unui 409 (schema `ConflictInterval`), dacă există. */
function readFreeIntervals(body: object): FreeSlot[] | undefined {
  if (!('intervaleLibere' in body) || !Array.isArray(body.intervaleLibere)) {
    return undefined;
  }
  return body.intervaleLibere.filter(isFreeInterval);
}

function isFreeInterval(value: unknown): value is FreeSlot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { start, sfarsit } = value as Record<string, unknown>;
  return typeof start === 'string' && typeof sfarsit === 'string';
}

/** Pasul la care se rotunjește în sus startul, când intervalul liber începe chiar acum. */
export const START_ROUNDING_MINUTES = 5;

/** Intervalul propus din unul liber; `shortened` arată că durata cerută nu a încăput. */
export type FittedInterval = { start: Date; end: Date; shortened: boolean };

/**
 * Intervalul propus când utilizatorul alege un interval liber: aceeași durată ca cererea inițială,
 * începând cu intervalul liber, dar fără să-l depășească.
 *
 * Câmpurile de dată au precizie de un minut, deci startul se rotunjește în sus la minut. Pentru
 * ziua de azi, backend-ul începe primul interval liber chiar de la ora curentă (cu secunde); dacă
 * acesta nu mai e în viitor, startul devine ora curentă rotunjită în sus la
 * {@link START_ROUNDING_MINUTES} minute, ca să mai fie valid și când se trimite cererea. Întoarce `undefined` dacă din intervalul liber nu mai rămâne nimic.
 */
export function fitToFreeInterval(
  free: FreeSlot,
  durationMs: number,
  now: Date = new Date(),
): FittedInterval | undefined {
  const freeStart = dayjs(free.start);
  const start = freeStart.isAfter(now)
    ? ceilTo(freeStart, 1)
    : ceilTo(dayjs(now).add(1, 'millisecond'), START_ROUNDING_MINUTES);
  const freeEnd = dayjs(free.sfarsit);
  if (!freeEnd.isAfter(start)) {
    return undefined;
  }
  const wanted = start.add(durationMs, 'millisecond');
  const fits = durationMs > 0 && !wanted.isAfter(freeEnd);
  return {
    start: start.toDate(),
    end: (fits ? wanted : freeEnd).toDate(),
    shortened: durationMs > 0 && !fits,
  };
}

/** Rotunjește în sus la un multiplu de `minutes` minute (o oră exactă rămâne neschimbată). */
function ceilTo(value: dayjs.Dayjs, minutes: number): dayjs.Dayjs {
  const step = minutes * 60_000;
  return dayjs(Math.ceil(value.valueOf() / step) * step);
}
