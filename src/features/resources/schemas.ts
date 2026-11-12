import { z } from 'zod';
import type { Resource, ResourceInput } from './types';

/**
 * Schema formularului de adăugare / editare resursă.
 *
 * Câmpurile sunt păstrate ca text (așa le dau câmpurile MUI); conversia la tipurile API
 * se face în {@link toResourceInput}.
 */
export const resourceFormSchema = z.object({
  denumire: z
    .string()
    .trim()
    .min(1, 'Denumirea este obligatorie.')
    .max(120, 'Denumirea poate avea cel mult 120 de caractere.'),
  categorieId: z.string().min(1, 'Alege o categorie.'),
  laboratorId: z.string().min(1, 'Alege un laborator.'),
  specificatii: z.string().trim().max(2000, 'Specificațiile pot avea cel mult 2000 de caractere.'),
  timpPregatireMin: z
    .string()
    .trim()
    .regex(/^\d*$/, 'Timpul de pregătire trebuie să fie un număr întreg, 0 sau mai mare.')
    .refine((value) => value === '' || Number(value) <= 1440, {
      message: 'Timpul de pregătire poate fi cel mult 1440 de minute.',
    }),
  reguliAcces: z.string().trim().max(500, 'Regulile de acces pot avea cel mult 500 de caractere.'),
});

/** Valorile formularului de resursă. */
export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

/** Verifică dacă un nume de câmp trimis de backend (la 400) există în formular. */
export function isResourceFormField(name: string): name is keyof ResourceFormValues {
  return Object.hasOwn(resourceFormSchema.shape, name);
}

/** Valorile inițiale: goale pentru adăugare, precompletate din resursă pentru editare. */
export function toResourceFormValues(resource?: Resource): ResourceFormValues {
  return {
    denumire: resource?.denumire ?? '',
    categorieId: resource?.categorie?.id?.toString() ?? '',
    laboratorId: resource?.laboratorId?.toString() ?? '',
    specificatii: resource?.specificatii ?? '',
    timpPregatireMin: resource?.timpPregatireMin?.toString() ?? '0',
    reguliAcces: resource?.reguliAcces ?? '',
  };
}

/** Corpul cererii POST / PUT, din valorile validate ale formularului. */
export function toResourceInput(values: ResourceFormValues): ResourceInput {
  return {
    denumire: values.denumire,
    categorieId: Number(values.categorieId),
    laboratorId: Number(values.laboratorId),
    specificatii: values.specificatii || undefined,
    timpPregatireMin: values.timpPregatireMin === '' ? 0 : Number(values.timpPregatireMin),
    reguliAcces: values.reguliAcces || undefined,
  };
}
