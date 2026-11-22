import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useIsMutating } from '@tanstack/react-query';
import { toApiError } from '../../../api/client';
import { CREATE_RESERVATION_KEY } from '../hooks/useCreateReservation';
import { useGrants } from '../hooks/useGrants';
import type { Reservation } from '../types';
import { NewReservationForm, type ReservationDraft } from './NewReservationForm';

export type NewReservationDialogProps = {
  resourceId: number;
  resourceName: string;
  /** Intervalul selectat în calendar; gol dacă dialogul s-a deschis din butonul „Rezervă”. */
  draft: ReservationDraft;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
};

/**
 * Dialogul „Rezervare nouă” pentru o resursă. Încarcă granturile utilizatorului, apoi afișează
 * formularul. Se montează doar cât e deschis, deci pornește de fiecare dată cu intervalul dat.
 */
export function NewReservationDialog({
  resourceId,
  resourceName,
  draft,
  onClose,
  onCreated,
}: NewReservationDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const grants = useGrants();
  const isSubmitting = useIsMutating({ mutationKey: CREATE_RESERVATION_KEY }) > 0;

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="new-reservation-title"
    >
      <DialogTitle id="new-reservation-title">Rezervare nouă · {resourceName}</DialogTitle>
      {grants.data && grants.data.length > 0 ? (
        <NewReservationForm
          resourceId={resourceId}
          grants={grants.data}
          draft={draft}
          onClose={onClose}
          onCreated={onCreated}
        />
      ) : (
        <>
          <DialogContent>
            {grants.isPending && <LinearProgress aria-label="Se încarcă granturile" />}
            {grants.isError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => grants.refetch()}>
                    Reîncearcă
                  </Button>
                }
              >
                Granturile nu au putut fi încărcate. {toApiError(grants.error).message}
              </Alert>
            )}
            {grants.data?.length === 0 && (
              <Alert severity="info">
                Nu faci parte din niciun grant, deci nu poți rezerva resurse. Cere coordonatorului
                grantului să te adauge ca membru.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Închide</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
