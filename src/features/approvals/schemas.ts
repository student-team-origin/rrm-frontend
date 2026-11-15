import { z } from 'zod';
import type { DecisionInput, DecisionKind } from './types';

/** Lungimea maximă a observației sau a motivului (ca în backend). */
export const OBSERVATION_MAX_LENGTH = 1000;

const tooLong = `Textul poate avea cel mult ${OBSERVATION_MAX_LENGTH} de caractere.`;

/** La aprobare, observația e opțională. */
export const approveSchema = z.object({
  observatie: z.string().trim().max(OBSERVATION_MAX_LENGTH, tooLong),
});

/** La respingere, motivul e obligatoriu (îl vede solicitantul). */
export const rejectSchema = z.object({
  observatie: z
    .string()
    .trim()
    .min(1, 'Motivul respingerii este obligatoriu.')
    .max(OBSERVATION_MAX_LENGTH, tooLong),
});

/** Valorile dialogului de decizie. */
export type DecisionValues = z.infer<typeof approveSchema>;

/** Schema potrivită deciziei. */
export function decisionSchema(kind: DecisionKind) {
  return kind === 'approve' ? approveSchema : rejectSchema;
}

/** Corpul cererii; o observație goală nu se trimite. */
export function toDecisionInput(values: DecisionValues): DecisionInput {
  return values.observatie ? { observatie: values.observatie } : {};
}
