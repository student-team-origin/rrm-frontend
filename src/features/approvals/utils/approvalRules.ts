import { getHttpStatus, toApiError } from '../../../api/client';
import type { ReservationStatus } from '../../reservations/types';
import type { Decision } from '../types';

/** Nivelul la care așteaptă o cerere, după starea ei; `undefined` dacă nu mai așteaptă. */
export function pendingLevelLabel(status: ReservationStatus | undefined): string | undefined {
  switch (status) {
    case 'InAsteptareCoordonator':
      return 'Nivelul 1 · Coordonator grant';
    case 'InAsteptareLaborator':
      return 'Nivelul 2 · Responsabil laborator';
    default:
      return undefined;
  }
}

/** Mesajul de după o decizie reușită: unde a ajuns cererea. */
export function decisionSuccessMessage(decision: Decision): string {
  if (decision.decizie === 'Respins') {
    return 'Cererea a fost respinsă. Intervalul a fost eliberat.';
  }
  return decision.nivel === 1
    ? 'Cererea a fost aprobată și trimisă responsabilului de laborator.'
    : 'Cererea a fost aprobată definitiv.';
}

/**
 * Mesajul pentru o decizie refuzată. 403 (nu e nivelul tău, propria cerere) și 409 (cererea nu mai
 * așteaptă sau a început) au deja mesaje clare de la backend.
 */
export function decisionErrorMessage(error: unknown): string {
  if (getHttpStatus(error) === 404) {
    return 'Cererea nu mai există.';
  }
  return toApiError(error).message;
}

/** `true` dacă lista e probabil depășită (cererea a fost decisă sau a început între timp). */
export function isStaleListError(error: unknown): boolean {
  const status = getHttpStatus(error);
  return status === 404 || status === 409;
}
