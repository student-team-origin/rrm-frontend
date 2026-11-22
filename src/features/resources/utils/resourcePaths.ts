/** Adresa paginii de detaliu a unei resurse (ruta `resources/:resourceId`). */
export function resourceDetailPath(resourceId: number): string {
  return `/resources/${resourceId}`;
}

/** Id-ul unei resurse dintr-un parametru de URL, sau `undefined` dacă nu e un întreg pozitiv. */
export function parseResourceId(value: string | null | undefined): number | undefined {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : undefined;
}
