import dayjs from 'dayjs';
import { getHttpStatus, toApiError } from '../../../api/client';
import type { Reservation, ReservationStatus } from '../types';

/** Stările din care solicitantul își poate anula rezervarea (ca în backend). */
export const CANCELLABLE_STATUSES: ReadonlySet<ReservationStatus> = new Set<ReservationStatus>([
  'InAsteptareCoordonator',
  'InAsteptareLaborator',
  'Aprobata',
]);

/** Etichetele nivelurilor de aprobare. */
export const APPROVAL_LEVEL_LABELS: Record<1 | 2, string> = {
  1: 'Coordonator grant',
  2: 'Responsabil laborator',
};

/**
 * `true` dacă rezervarea poate fi anulată acum: e în așteptare sau aprobată și nu a început.
 * Backend-ul verifică din nou; aici doar se ascunde butonul când anularea sigur nu e permisă.
 */
export function canCancel(reservation: Reservation, now: Date = new Date()): boolean {
  return (
    reservation.stare !== undefined &&
    CANCELLABLE_STATUSES.has(reservation.stare) &&
    reservation.start !== undefined &&
    dayjs(reservation.start).isAfter(now)
  );
}

/** Mesajul afișat când anularea nu reușește. */
export function cancelErrorMessage(error: unknown): string {
  switch (getHttpStatus(error)) {
    case 403:
      return 'Poți anula doar rezervările tale.';
    case 404:
      return 'Rezervarea nu mai există.';
    default:
      // 409: backend-ul explică motivul (a început deja, starea nu mai permite anularea).
      return toApiError(error).message;
  }
}
