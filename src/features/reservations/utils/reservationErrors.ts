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

/**
 * Intervalul propus când utilizatorul alege un interval liber: aceeași durată ca cererea inițială,
 * începând cu intervalul liber, dar fără să-l depășească.
 */
export function fitToFreeInterval(free: FreeSlot, durationMs: number): { start: Date; end: Date } {
  const start = dayjs(free.start);
  const freeEnd = dayjs(free.sfarsit);
  const wanted = start.add(Math.max(durationMs, 0), 'millisecond');
  const end = durationMs > 0 && wanted.isBefore(freeEnd) ? wanted : freeEnd;
  return { start: start.toDate(), end: end.toDate() };
}
