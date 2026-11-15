import { cancelReservationSchema, toCancelReservationInput } from './schemas';

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
