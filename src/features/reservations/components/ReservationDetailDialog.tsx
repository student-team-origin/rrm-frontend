import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { toApiError } from '../../../api/client';
import { formatDateTime, formatDateTimeRange } from '../../../shared/utils/formatDate';
import { useReservation } from '../hooks/useReservation';
import type { Reservation, ReservationDetail } from '../types';
import { canCancel } from '../utils/reservationRules';
import { ApprovalHistory } from './ApprovalHistory';
import { ReservationStatusChip } from './ReservationStatusChip';

export type ReservationDetailDialogProps = {
  reservationId: number;
  onClose: () => void;
  onCancel: (reservation: Reservation, resourceName?: string) => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function DetailContent({ reservation }: { reservation: ReservationDetail }) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="h6" component="p" sx={{ flexGrow: 1 }}>
          {reservation.resursa?.denumire ?? `Resursa #${reservation.resursaId}`}
        </Typography>
        {reservation.stare && <ReservationStatusChip status={reservation.stare} />}
      </Stack>
      {reservation.start && reservation.sfarsit && (
        <Field
          label="Interval"
          value={formatDateTimeRange(reservation.start, reservation.sfarsit)}
        />
      )}
      <Field label="Ore solicitate" value={String(reservation.oreSolicitate ?? '—')} />
      <Field label="Scop" value={reservation.scop ?? '—'} />
      {reservation.dataCreare && (
        <Field label="Cerută la" value={formatDateTime(reservation.dataCreare)} />
      )}
      {reservation.dataCheckIn && (
        <Field label="Check-in" value={formatDateTime(reservation.dataCheckIn)} />
      )}
      <Divider />
      <Typography variant="subtitle1" component="h3">
        Istoricul aprobărilor
      </Typography>
      <ApprovalHistory approvals={reservation.aprobari ?? []} status={reservation.stare} />
    </Stack>
  );
}

/** Detaliul unei rezervări: datele cererii, starea și istoricul aprobărilor. */
export function ReservationDetailDialog({
  reservationId,
  onClose,
  onCancel,
}: ReservationDetailDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const query = useReservation(reservationId);
  const reservation = query.data;

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="reservation-detail-title"
    >
      <DialogTitle id="reservation-detail-title">Detaliile rezervării</DialogTitle>
      <DialogContent>
        {query.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress aria-label="Se încarcă rezervarea" />
          </Box>
        )}
        {query.isError && (
          <Alert severity="error">
            Rezervarea nu a putut fi încărcată. {toApiError(query.error).message}
          </Alert>
        )}
        {reservation && <DetailContent reservation={reservation} />}
      </DialogContent>
      <DialogActions>
        {reservation && canCancel(reservation) && (
          <Button
            color="error"
            onClick={() => onCancel(reservation, reservation.resursa?.denumire)}
          >
            Anulează rezervarea
          </Button>
        )}
        <Button onClick={onClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  );
}
