import { Button, Stack, TableCell, TableRow } from '@mui/material';
import { formatDateTimeRange } from '../../../shared/utils/formatDate';
import type { Reservation } from '../types';
import { canCancel } from '../utils/reservationRules';
import { ReservationStatusChip } from './ReservationStatusChip';

export type ReservationRowProps = {
  reservation: Reservation;
  /** Numele resursei rezervate (sau un înlocuitor, cât timp nu e încărcat). */
  resourceName: string;
  onOpenDetail: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
};

/**
 * Un rând din „Rezervările mele”. Starea vine imediat după resursă, ca pe telefon să fie vizibilă
 * fără derulare orizontală.
 */
export function ReservationRow({
  reservation,
  resourceName,
  onOpenDetail,
  onCancel,
}: ReservationRowProps) {
  const interval =
    reservation.start && reservation.sfarsit
      ? formatDateTimeRange(reservation.start, reservation.sfarsit)
      : undefined;
  // Numele accesibil al butoanelor: pe aceeași pagină pot fi mai multe rezervări ale aceleiași
  // resurse, deci intervalul le deosebește pentru cititoarele de ecran.
  const label = interval ? `${resourceName}, ${interval}` : resourceName;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 'fontWeightMedium', whiteSpace: 'nowrap' }}>
        {resourceName}
      </TableCell>
      <TableCell>
        {reservation.stare ? <ReservationStatusChip status={reservation.stare} /> : '—'}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{interval ?? '—'}</TableCell>
      <TableCell align="right">{reservation.oreSolicitate ?? '—'}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button
            size="small"
            aria-label={`Detalii rezervare ${label}`}
            onClick={() => onOpenDetail(reservation)}
          >
            Detalii
          </Button>
          {canCancel(reservation) && (
            <Button
              size="small"
              color="error"
              aria-label={`Anulează rezervarea ${label}`}
              onClick={() => onCancel(reservation)}
            >
              Anulează
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
