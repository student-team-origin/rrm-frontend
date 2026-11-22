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
  const BEFORE = new Date('2026-11-20T09:00:00+02:00');

  it('păstrează durata cerută, de la începutul intervalului liber', () => {
    expect(fitToFreeInterval(FREE, 2 * HOUR, BEFORE)).toEqual({
      start: new Date('2026-11-20T12:00:00+02:00'),
      end: new Date('2026-11-20T14:00:00+02:00'),
      shortened: false,
    });
  });

  it('nu depășește intervalul liber și anunță că l-a scurtat', () => {
    expect(fitToFreeInterval(FREE, 10 * HOUR, BEFORE)).toMatchObject({
      end: new Date('2026-11-20T18:00:00+02:00'),
      shortened: true,
    });
  });

  it('azi, mută startul care e „acum, cu secunde” în viitor, rotunjit la 5 minute', () => {
    const now = new Date('2026-11-20T14:37:22+02:00');
    const free = { start: now.toISOString(), sfarsit: '2026-11-20T18:00:00+02:00' };
    expect(fitToFreeInterval(free, 2 * HOUR, now)).toEqual({
      start: new Date('2026-11-20T14:40:00+02:00'),
      end: new Date('2026-11-20T16:40:00+02:00'),
      shortened: false,
    });
  });

  it('rotunjește în sus la minut un start viitor cu secunde', () => {
    const free = { start: '2026-11-20T12:15:30+02:00', sfarsit: '2026-11-20T18:00:00+02:00' };
    expect(fitToFreeInterval(free, HOUR, BEFORE)?.start).toEqual(
      new Date('2026-11-20T12:16:00+02:00'),
    );
  });

  it('nu propune nimic dacă intervalul liber s-a terminat între timp', () => {
    const now = new Date('2026-11-20T17:58:00+02:00');
    expect(fitToFreeInterval(FREE, HOUR, now)).toBeUndefined();
  });
});
