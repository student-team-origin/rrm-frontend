import dayjs from 'dayjs';
import {
  cancelReservationSchema,
  newReservationSchema,
  toCancelReservationInput,
  toReservationInput,
} from './schemas';

describe('cancelReservationSchema', () => {
  it('acceptă un motiv gol și nu îl trimite', () => {
    const values = cancelReservationSchema.parse({ motiv: '   ' });
    expect(toCancelReservationInput(values)).toEqual({});
  });

  it('trimite motivul fără spații la capete', () => {
    const values = cancelReservationSchema.parse({ motiv: '  Nu mai am nevoie ' });
    expect(toCancelReservationInput(values)).toEqual({ motiv: 'Nu mai am nevoie' });
  });

  it('respinge un motiv mai lung de 500 de caractere', () => {
    const result = cancelReservationSchema.safeParse({ motiv: 'x'.repeat(501) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Motivul poate avea cel mult 500 de caractere.');
  });
});

describe('newReservationSchema', () => {
  const NOW = new Date('2026-11-20T09:00:00');
  const schema = newReservationSchema(() => NOW);
  const VALID = {
    grantId: '3',
    start: '2026-11-20T10:00',
    sfarsit: '2026-11-20T12:00',
    scop: '  Testare traiectorii ',
  };

  function errorsOf(values: Partial<typeof VALID>) {
    const result = schema.safeParse({ ...VALID, ...values });
    return Object.fromEntries(
      (result.error?.issues ?? []).map((issue) => [issue.path[0], issue.message]),
    );
  }

  it('acceptă o cerere validă și o transformă în corpul cererii, cu fusul orar local', () => {
    const values = schema.parse(VALID);
    const input = toReservationInput(15, values);
    expect(input).toMatchObject({ resursaId: 15, grantId: 3, scop: 'Testare traiectorii' });
    expect(input.start).toBe(dayjs('2026-11-20T10:00').format());
    expect(input.start).toMatch(/^2026-11-20T10:00:00[+-]\d{2}:\d{2}$/);
  });

  it('cere grantul, intervalul și scopul', () => {
    expect(errorsOf({ grantId: '', start: '', sfarsit: '', scop: ' ' })).toEqual({
      grantId: 'Alege grantul pe care se rezervă.',
      start: 'Alege începutul intervalului.',
      sfarsit: 'Alege sfârșitul intervalului.',
      scop: 'Scopul este obligatoriu.',
    });
  });

  it('respinge un start în trecut și un sfârșit înainte de start', () => {
    expect(errorsOf({ start: '2026-11-20T08:00', sfarsit: '2026-11-20T07:00' })).toEqual({
      start: 'Startul trebuie să fie în viitor.',
      sfarsit: 'Sfârșitul trebuie să fie după start.',
    });
  });

  it('respinge un scop mai lung de 1000 de caractere', () => {
    expect(errorsOf({ scop: 'x'.repeat(1001) })).toEqual({
      scop: 'Scopul poate avea cel mult 1000 de caractere.',
    });
  });
});
