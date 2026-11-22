import { httpError } from '../../../api/testUtils';
import { fitToFreeInterval, toCreateReservationError } from './reservationErrors';

const HOUR = 60 * 60 * 1000;

describe('toCreateReservationError', () => {
  it('la 409 întoarce intervalele libere din răspuns', () => {
    const error = httpError(409, {
      code: 'INTERVAL_OCUPAT',
      message: 'Intervalul selectat se suprapune cu o altă rezervare.',
      intervaleLibere: [
        { start: '2026-11-20T12:15:00+02:00', sfarsit: '2026-11-20T18:00:00+02:00' },
      ],
    } as Parameters<typeof httpError>[1]);
    expect(toCreateReservationError(error)).toEqual({
      kind: 'conflict',
      message: 'Intervalul ales se suprapune cu o altă rezervare.',
      freeIntervals: [{ start: '2026-11-20T12:15:00+02:00', sfarsit: '2026-11-20T18:00:00+02:00' }],
    });
  });

  it('la 409 fără intervale libere nu inventează niciunul', () => {
    const error = httpError(409, { code: 'INTERVAL_OCUPAT', message: 'Ocupat.' });
    expect(toCreateReservationError(error)).toMatchObject({
      kind: 'conflict',
      freeIntervals: undefined,
    });
  });

  it('la 422 păstrează mesajul backend-ului (soldul grantului)', () => {
    const message = 'Grantul mai are 1 ore disponibile, iar rezervarea necesită 2 ore.';
    const error = httpError(422, { code: 'SOLD_INSUFICIENT', message });
    expect(toCreateReservationError(error)).toEqual({ kind: 'businessRule', message });
  });
});

describe('fitToFreeInterval', () => {
  const FREE = { start: '2026-11-20T12:00:00+02:00', sfarsit: '2026-11-20T18:00:00+02:00' };

  it('păstrează durata cerută, de la începutul intervalului liber', () => {
    const { start, end } = fitToFreeInterval(FREE, 2 * HOUR);
    expect(start.toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-20T12:00:00.000Z');
  });

  it('nu depășește intervalul liber', () => {
    const { end } = fitToFreeInterval(FREE, 10 * HOUR);
    expect(end.toISOString()).toBe('2026-11-20T16:00:00.000Z');
  });
});
