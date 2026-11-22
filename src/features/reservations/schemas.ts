import dayjs from 'dayjs';
import { z } from 'zod';
import type { CancelReservationInput, ReservationInput } from './types';

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

/** Lungimea maximă a scopului unei rezervări (ca în backend). */
export const PURPOSE_MAX_LENGTH = 1000;

/** Formatul valorilor câmpurilor `datetime-local` (ora locală, fără fus orar). */
export const DATE_TIME_INPUT_FORMAT = 'YYYY-MM-DDTHH:mm';

/**
 * Schema formularului „Rezervare nouă”. Câmpurile de dată au formatul `datetime-local`, iar
 * grantul e id-ul ca text (valoarea din listă). `now` se poate înlocui în teste.
 */
export function newReservationSchema(now: () => Date = () => new Date()) {
  return z
    .object({
      grantId: z.string().min(1, 'Alege grantul pe care se rezervă.'),
      start: z.string().min(1, 'Alege începutul intervalului.'),
      sfarsit: z.string().min(1, 'Alege sfârșitul intervalului.'),
      scop: z
        .string()
        .trim()
        .min(1, 'Scopul este obligatoriu.')
        .max(PURPOSE_MAX_LENGTH, `Scopul poate avea cel mult ${PURPOSE_MAX_LENGTH} de caractere.`),
    })
    .superRefine((values, ctx) => {
      const start = dayjs(values.start);
      const end = dayjs(values.sfarsit);
      // Câmpurile goale au deja mesajul lor.
      if (!start.isValid()) {
        return;
      }
      if (!start.isAfter(now())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['start'],
          message: 'Startul trebuie să fie în viitor.',
        });
      }
      if (end.isValid() && !end.isAfter(start)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sfarsit'],
          message: 'Sfârșitul trebuie să fie după start.',
        });
      }
    });
}

/** Valorile formularului „Rezervare nouă”. */
export type NewReservationValues = z.infer<ReturnType<typeof newReservationSchema>>;

/** Câmpurile formularului „Rezervare nouă” (pentru erorile primite de la backend). */
const NEW_RESERVATION_FIELDS = ['grantId', 'start', 'sfarsit', 'scop'] as const;

/** `true` dacă backend-ul a trimis o eroare pentru un câmp al formularului. */
export function isNewReservationField(field: string): field is keyof NewReservationValues {
  return (NEW_RESERVATION_FIELDS as readonly string[]).includes(field);
}

/** Valoarea unui câmp `datetime-local` pentru data dată (gol dacă lipsește). */
export function toDateTimeInput(value: Date | string | undefined): string {
  return value ? dayjs(value).format(DATE_TIME_INPUT_FORMAT) : '';
}

/**
 * Corpul cererii `POST /reservations`. Orele se trimit cu fusul orar local (ex. `+02:00`): după el
 * alege backend-ul ziua pentru intervalele libere propuse la 409.
 */
export function toReservationInput(
  resourceId: number,
  values: NewReservationValues,
): ReservationInput {
  return {
    resursaId: resourceId,
    grantId: Number(values.grantId),
    start: dayjs(values.start).format(),
    sfarsit: dayjs(values.sfarsit).format(),
    scop: values.scop,
  };
}
