import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { formatDateTimeRange } from '../../../shared/utils/formatDate';
import { useCancelReservation } from '../hooks/useCancelReservation';
import {
  CANCEL_REASON_MAX_LENGTH,
  cancelReservationSchema,
  toCancelReservationInput,
  type CancelReservationValues,
} from '../schemas';
import type { Reservation } from '../types';
import { cancelErrorMessage } from '../utils/reservationRules';

export type CancelReservationDialogProps = {
  reservation: Reservation;
  /** Numele resursei rezervate, dacă e cunoscut. */
  resourceName?: string;
  onClose: () => void;
  onCancelled: () => void;
};

/** Confirmarea anulării unei rezervări, cu un motiv opțional. */
export function CancelReservationDialog({
  reservation,
  resourceName,
  onClose,
  onCancelled,
}: CancelReservationDialogProps) {
  const cancelMutation = useCancelReservation();
  const isCancelling = cancelMutation.isPending;
  const form = useForm<CancelReservationValues>({
    resolver: zodResolver(cancelReservationSchema),
    defaultValues: { motiv: '' },
  });
  const reasonError = form.formState.errors.motiv?.message;

  const handleConfirm = form.handleSubmit((values) => {
    if (reservation.id === undefined) {
      return;
    }
    cancelMutation.mutate(
      { id: reservation.id, input: toCancelReservationInput(values) },
      { onSuccess: onCancelled },
    );
  });

  const interval =
    reservation.start && reservation.sfarsit
      ? ` din ${formatDateTimeRange(reservation.start, reservation.sfarsit)}`
      : '';

  return (
    <Dialog
      open
      onClose={isCancelling ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="cancel-reservation-title"
    >
      <DialogTitle id="cancel-reservation-title">Anulează rezervarea</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="cancel-reservation-form"
          noValidate
          onSubmit={handleConfirm}
          spacing={2}
        >
          {cancelMutation.isError && (
            <Alert severity="error">{cancelErrorMessage(cancelMutation.error)}</Alert>
          )}
          <DialogContentText>
            Sigur anulezi rezervarea pentru „{resourceName ?? `resursa #${reservation.resursaId}`}”
            {interval}? Intervalul se eliberează, iar orele revin în soldul grantului.
          </DialogContentText>
          <TextField
            label="Motiv (opțional)"
            multiline
            minRows={2}
            {...form.register('motiv')}
            error={reasonError !== undefined}
            helperText={reasonError}
            slotProps={{ htmlInput: { maxLength: CANCEL_REASON_MAX_LENGTH + 1 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isCancelling}>
          Renunță
        </Button>
        <Button
          type="submit"
          form="cancel-reservation-form"
          color="error"
          variant="contained"
          disabled={isCancelling}
          startIcon={isCancelling ? <CircularProgress size="1em" color="inherit" /> : undefined}
        >
          Anulează rezervarea
        </Button>
      </DialogActions>
    </Dialog>
  );
}
