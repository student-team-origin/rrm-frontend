import { approveSchema, rejectSchema, toDecisionInput } from './schemas';

describe('schemele deciziei', () => {
  it('la aprobare acceptă observația goală și nu o trimite', () => {
    expect(toDecisionInput(approveSchema.parse({ observatie: '  ' }))).toEqual({});
  });

  it('la respingere cere motivul', () => {
    const result = rejectSchema.safeParse({ observatie: '   ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Motivul respingerii este obligatoriu.');
  });

  it('trimite motivul fără spații la capete', () => {
    expect(toDecisionInput(rejectSchema.parse({ observatie: ' Nu ține de grant ' }))).toEqual({
      observatie: 'Nu ține de grant',
    });
  });

  it('respinge un text mai lung de 1000 de caractere', () => {
    expect(approveSchema.safeParse({ observatie: 'x'.repeat(1001) }).success).toBe(false);
  });
});
