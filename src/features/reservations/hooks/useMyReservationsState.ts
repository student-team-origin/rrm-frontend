import { useMemo, useState } from 'react';
import type { Reservation, ReservationListParams, ReservationStatus } from '../types';

/** Numărul implicit de rezervări pe pagină. */
export const DEFAULT_PAGE_SIZE = 20;

/** Rezervarea pentru care e deschisă confirmarea anulării. */
export type CancelTarget = { reservation: Reservation; resourceName?: string };

/**
 * Starea locală a paginii „Rezervările mele”: filtrul de stare, paginarea, dialogurile deschise
 * (detaliu, anulare) și mesajul de după anulare. Orice schimbare de filtru revine la prima pagină.
 */
export function useMyReservationsState() {
  const [status, setStatusState] = useState<ReservationStatus>();
  const [page, setPage] = useState(0);
  const [size, setSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [detailId, setDetailId] = useState<number>();
  const [cancelTarget, setCancelTarget] = useState<CancelTarget>();
  const [feedback, setFeedback] = useState<string>();

  const params = useMemo<ReservationListParams>(
    () => ({ ...(status ? { stare: status } : {}), page, size }),
    [status, page, size],
  );

  return {
    status,
    page,
    size,
    params,
    detailId,
    cancelTarget,
    feedback,
    setStatus: (value: ReservationStatus | undefined) => {
      setStatusState(value);
      setPage(0);
    },
    setPage,
    setSize: (value: number) => {
      setSizeState(value);
      setPage(0);
    },
    openDetail: (reservation: Reservation) => setDetailId(reservation.id),
    closeDetail: () => setDetailId(undefined),
    openCancel: (reservation: Reservation, resourceName?: string) =>
      setCancelTarget({ reservation, resourceName }),
    closeCancel: () => setCancelTarget(undefined),
    /** După anulare: închide dialogurile și afișează confirmarea. */
    notifyCancelled: () => {
      setCancelTarget(undefined);
      setDetailId(undefined);
      setFeedback('Rezervarea a fost anulată. Intervalul a fost eliberat.');
    },
    clearFeedback: () => setFeedback(undefined),
  };
}
