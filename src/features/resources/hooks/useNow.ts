import { useEffect, useState } from 'react';

/** Cât de des se actualizează ora curentă în calendar (un minut). */
export const NOW_REFRESH_MS = 60_000;

/**
 * Ora curentă, actualizată la fiecare {@link NOW_REFRESH_MS} ms, ca o pagină lăsată deschisă să
 * nu rămână cu momentul încărcării (de exemplu, începutul zonei „Mentenanță” din calendar).
 */
export function useNow(refreshMs = NOW_REFRESH_MS): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);
  return now;
}
