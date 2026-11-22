import dayjs from 'dayjs';
import type { Grant } from '../types';

/** De ce nu se poate rezerva pe un grant (afișat lângă el în listă), sau `undefined` dacă se poate. */
export function grantUnavailableReason(grant: Grant, today: Date = new Date()): string | undefined {
  if (grant.dataSfarsit && dayjs(grant.dataSfarsit).isBefore(today, 'day')) {
    return 'expirat';
  }
  if ((grant.oreRamase ?? 0) <= 0) {
    return 'fără ore rămase';
  }
  return undefined;
}

/** `true` dacă grantul n-a expirat și mai are ore, deci se poate rezerva pe el. */
export function isGrantUsable(grant: Grant, today: Date = new Date()): boolean {
  return grantUnavailableReason(grant, today) === undefined;
}
