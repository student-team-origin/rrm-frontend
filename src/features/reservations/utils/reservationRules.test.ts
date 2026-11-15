import { httpError } from '../../../api/testUtils';
import type { Reservation, ReservationStatus } from '../types';
import { cancelErrorMessage, canCancel } from './reservationRules';

const NOW = new Date('2026-11-15T10:00:00Z');

function reservation(stare: ReservationStatus, start: string): Reservation {
  return { id: 1, stare, start, sfarsit: '2026-11-20T12:00:00Z' };
}

describe('canCancel', () => {
  it.each<ReservationStatus>(['InAsteptareCoordonator', 'InAsteptareLaborator', 'Aprobata'])(
    'permite anularea în starea %s, înainte de start',
    (stare) => {
      expect(canCancel(reservation(stare, '2026-11-15T10:01:00Z'), NOW)).toBe(true);
    },
  );

  it.each<ReservationStatus>(['Activa', 'Finalizata', 'Respinsa', 'Anulata', 'AnulataAutomat'])(
    'nu permite anularea în starea %s',
    (stare) => {
      expect(canCancel(reservation(stare, '2026-11-20T10:00:00Z'), NOW)).toBe(false);
    },
  );

  it('nu permite anularea la start sau după', () => {
    expect(canCancel(reservation('Aprobata', '2026-11-15T10:00:00Z'), NOW)).toBe(false);
    expect(canCancel(reservation('Aprobata', '2026-11-15T09:00:00Z'), NOW)).toBe(false);
  });
});

describe('cancelErrorMessage', () => {
  it('folosește mesajul backend-ului la 409', () => {
    const error = httpError(409, {
      code: 'ANULARE_NEPERMISA',
      message: 'Nu mai poate fi anulată.',
    });
    expect(cancelErrorMessage(error)).toBe('Nu mai poate fi anulată.');
  });

  it('are mesaje fixe pentru 403 și 404', () => {
    expect(cancelErrorMessage(httpError(403, { code: 'X', message: 'x' }))).toBe(
      'Poți anula doar rezervările tale.',
    );
    expect(cancelErrorMessage(httpError(404, { code: 'X', message: 'x' }))).toBe(
      'Rezervarea nu mai există.',
    );
  });
});
