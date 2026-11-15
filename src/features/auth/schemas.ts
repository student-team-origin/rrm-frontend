import { z } from 'zod';

/** Schema formularului de autentificare. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'E-mailul este obligatoriu.')
    .email('E-mailul nu are un format valid.'),
  // Limita de 72 vine din backend (BCrypt folosește doar primii 72 de octeți ai parolei).
  parola: z
    .string()
    .min(1, 'Parola este obligatorie.')
    .max(72, 'Parola poate avea cel mult 72 de caractere.'),
});

/** Valorile formularului de autentificare. */
export type LoginFormValues = z.infer<typeof loginSchema>;
