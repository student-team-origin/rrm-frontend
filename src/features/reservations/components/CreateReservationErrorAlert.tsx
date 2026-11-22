import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { CreateReservationError, FreeSlot } from '../utils/reservationErrors';

export type CreateReservationErrorAlertProps = {
  error: CreateReservationError;
  /** Apelat când utilizatorul alege unul dintre intervalele libere propuse la 409. */
  onPickFreeInterval: (interval: FreeSlot) => void;
};

/**
 * Eroarea la trimiterea cererii. La 409 (interval ocupat) arată intervalele libere din acea zi, pe
 * care utilizatorul le poate alege; la 422 (sold insuficient, resursă indisponibilă), motivul.
 */
export function CreateReservationErrorAlert({
  error,
  onPickFreeInterval,
}: CreateReservationErrorAlertProps) {
  if (error.kind !== 'conflict') {
    return (
      <Alert severity="error">
        {error.kind === 'businessRule' && <AlertTitle>Cererea nu poate fi trimisă</AlertTitle>}
        {error.message}
      </Alert>
    );
  }

  const { freeIntervals } = error;
  return (
    <Alert severity="warning">
      <AlertTitle>Interval ocupat</AlertTitle>
      {error.message} {freeIntervals === undefined && 'Alege alt interval din calendar.'}
      {freeIntervals?.length === 0 && 'Nu mai sunt intervale libere în acea zi.'}
      {freeIntervals !== undefined && freeIntervals.length > 0 && (
        <>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Intervale libere în {dayjs(freeIntervals[0]?.start).format('D MMMM')}:
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
            {freeIntervals.map((interval) => (
              <Button
                key={interval.start}
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => onPickFreeInterval(interval)}
              >
                {formatTimeRange(interval)}
              </Button>
            ))}
          </Stack>
        </>
      )}
    </Alert>
  );
}

function formatTimeRange({ start, sfarsit }: FreeSlot): string {
  const end = dayjs(sfarsit);
  // Intervalul liber de la finalul zilei se termină la miezul nopții următoare.
  const endText = end.isSame(start, 'day') ? end.format('HH:mm') : '24:00';
  return `${dayjs(start).format('HH:mm')}–${endText}`;
}
