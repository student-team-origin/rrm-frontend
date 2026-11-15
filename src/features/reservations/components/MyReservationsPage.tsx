import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, type ChangeEvent } from 'react';
import { toApiError } from '../../../api/client';
import { reservationStatusLabels } from '../../../theme';
import { useMyReservations } from '../hooks/useMyReservations';
import { useMyReservationsState } from '../hooks/useMyReservationsState';
import { useResourceNames } from '../hooks/useResourceNames';
import type { ReservationStatus } from '../types';
import { CancelReservationDialog } from './CancelReservationDialog';
import { ReservationDetailDialog } from './ReservationDetailDialog';
import { ReservationTable } from './ReservationTable';

const ALL = '';
const STATUSES = Object.keys(reservationStatusLabels) as ReservationStatus[];

function isStatus(value: string): value is ReservationStatus {
  return (STATUSES as string[]).includes(value);
}

/**
 * Pagina „Rezervările mele”: rezervările utilizatorului cu starea curentă, detaliul cu istoricul
 * aprobărilor și anularea unei rezervări care nu a început.
 */
export function MyReservationsPage() {
  const state = useMyReservationsState();
  const query = useMyReservations(state.params);
  const reservations = useMemo(() => query.data?.items ?? [], [query.data]);
  const resourceIds = useMemo(
    () => reservations.flatMap((r) => (r.resursaId !== undefined ? [r.resursaId] : [])),
    [reservations],
  );
  const resourceNames = useResourceNames(resourceIds);
  const isRefreshing = query.isFetching && !query.isPending;

  const handleStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    state.setStatus(isStatus(value) ? value : undefined);
  };

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="h4" component="h1">
          Rezervările mele
        </Typography>
        <TextField
          select
          label="Stare"
          size="small"
          value={state.status ?? ALL}
          onChange={handleStatusChange}
          sx={{ minWidth: { sm: 240 } }}
        >
          <MenuItem value={ALL}>Toate</MenuItem>
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {reservationStatusLabels[status]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Reîncearcă
            </Button>
          }
        >
          Rezervările nu au putut fi încărcate. {toApiError(query.error).message}
        </Alert>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {isRefreshing && (
            <LinearProgress
              aria-label="Se actualizează lista"
              sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
            />
          )}
          <ReservationTable
            reservations={reservations}
            resourceNames={resourceNames}
            isLoading={query.isPending}
            total={query.data?.total ?? 0}
            page={state.page}
            size={state.size}
            onPageChange={state.setPage}
            onSizeChange={state.setSize}
            onOpenDetail={state.openDetail}
            onCancel={(reservation) =>
              state.openCancel(
                reservation,
                reservation.resursaId !== undefined
                  ? resourceNames.get(reservation.resursaId)
                  : undefined,
              )
            }
          />
        </Box>
      )}

      {state.detailId !== undefined && (
        <ReservationDetailDialog
          reservationId={state.detailId}
          onClose={state.closeDetail}
          onCancel={state.openCancel}
        />
      )}
      {state.cancelTarget && (
        <CancelReservationDialog
          reservation={state.cancelTarget.reservation}
          resourceName={state.cancelTarget.resourceName}
          onClose={state.closeCancel}
          onCancelled={state.notifyCancelled}
        />
      )}

      <Snackbar
        open={state.feedback !== undefined}
        autoHideDuration={5000}
        onClose={state.clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {state.feedback ? (
          <Alert severity="success" variant="filled" onClose={state.clearFeedback}>
            {state.feedback}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
