import { describe, expect, it } from 'vitest';
import { resourceFormSchema, toResourceFormValues } from './schemas';

const validValues = { ...toResourceFormValues(), categorieId: '1', laboratorId: '1' };

describe('resourceFormSchema', () => {
  // Limita vine din coloana resursa.denumire VARCHAR(120); backend-ul respinge peste ea.
  it('acceptă o denumire de 120 de caractere', () => {
    const result = resourceFormSchema.safeParse({ ...validValues, denumire: 'a'.repeat(120) });
    expect(result.success).toBe(true);
  });

  it('respinge o denumire de 121 de caractere', () => {
    const result = resourceFormSchema.safeParse({ ...validValues, denumire: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });
});
