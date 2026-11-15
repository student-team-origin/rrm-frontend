import { z } from 'zod';
import type { CancelReservationInput } from './types';

/** Lungimea maximă a motivului de anulare (ca în backend). */
export const CANCEL_REASON_MAX_LENGTH = 500;

/** Schema dialogului de anulare: motivul e opțional. */
export const cancelReservationSchema = z.object({
  motiv: z
    .string()
    .trim()
    .max(
      CANCEL_REASON_MAX_LENGTH,
      `Motivul poate avea cel mult ${CANCEL_REASON_MAX_LENGTH} de caractere.`,
    ),
});

/** Valorile dialogului de anulare. */
export type CancelReservationValues = z.infer<typeof cancelReservationSchema>;

/** Corpul cererii de anulare; un motiv gol nu se trimite. */
export function toCancelReservationInput(values: CancelReservationValues): CancelReservationInput {
  return values.motiv ? { motiv: values.motiv } : {};
}
