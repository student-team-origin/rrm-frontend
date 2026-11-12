import { getHttpStatus, toApiError } from '../../../api/client';

/** Mesajul afișat când ștergerea e refuzată cu 409. */
export const DELETE_CONFLICT_MESSAGE = 'Resursa are rezervări și nu poate fi ștearsă.';

/** Mesajul afișat la 404: resursa a fost ștearsă între timp. */
export const NOT_FOUND_MESSAGE = 'Resursa nu mai există. Probabil a fost ștearsă între timp.';

/**
 * Mesajul pentru o eroare la salvarea, ștergerea sau schimbarea stării unei resurse.
 * 404 și 409 primesc mesaje fixe; restul, mesajul trimis de backend.
 */
export function resourceErrorMessage(error: unknown, action: 'save' | 'delete' | 'status'): string {
  const status = getHttpStatus(error);
  if (status === 404) {
    return NOT_FOUND_MESSAGE;
  }
  if (status === 409 && action === 'delete') {
    return DELETE_CONFLICT_MESSAGE;
  }
  return toApiError(error).message;
}

/** Erorile de validare pe câmpuri trimise de backend la 400 (nume câmp → mesaj). */
export function serverFieldErrors(error: unknown): Record<string, string> {
  return getHttpStatus(error) === 400 ? (toApiError(error).fields ?? {}) : {};
}
