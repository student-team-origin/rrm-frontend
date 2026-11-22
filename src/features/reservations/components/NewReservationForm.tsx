import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CircularProgress, DialogActions, DialogContent, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getHttpStatus, toApiError } from '../../../api/client';
import { useCreateReservation } from '../hooks/useCreateReservation';
import {
  isNewReservationField,
  newReservationSchema,
  toDateTimeInput,
  toReservationInput,
  type NewReservationValues,
} from '../schemas';
import type { Grant, Reservation } from '../types';
import {
  fitToFreeInterval,
  toCreateReservationError,
  type CreateReservationError,
  type FreeSlot,
} from '../utils/reservationErrors';
import { CreateReservationErrorAlert } from './CreateReservationErrorAlert';
import { NewReservationFields } from './NewReservationFields';

/** Intervalul cu care se deschide formularul (de regulă, cel selectat în calendar). */
export type ReservationDraft = { start?: Date; end?: Date };

export type NewReservationFormProps = {
  resourceId: number;
  grants: Grant[];
  draft: ReservationDraft;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
};

const schema = newReservationSchema();

/** Conținutul și butoanele dialogului „Rezervare nouă”, cu validare și erorile 400 / 409 / 422. */
export function NewReservationForm({
  resourceId,
  grants,
  draft,
  onClose,
  onCreated,
}: NewReservationFormProps) {
  const createReservation = useCreateReservation();
  const [submitError, setSubmitError] = useState<CreateReservationError>();
  const form = useForm<NewReservationValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      start: toDateTimeInput(draft.start),
      sfarsit: toDateTimeInput(draft.end),
      // Cu un singur grant, nu are rost să-l mai aleagă utilizatorul.
      grantId: grants.length === 1 ? String(grants[0]?.id) : '',
      scop: '',
    },
  });
  const isSubmitting = createReservation.isPending;

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      onCreated(await createReservation.mutateAsync(toReservationInput(resourceId, values)));
    } catch (error) {
      showError(error);
    }
  });

  /** Erorile 400 pe câmpuri merg sub câmpuri; restul (409, 422 etc.), deasupra formularului. */
  const showError = (error: unknown) => {
    const fields = getHttpStatus(error) === 400 ? (toApiError(error).fields ?? {}) : {};
    let shownOnFields = 0;
    Object.entries(fields).forEach(([field, message]) => {
      if (isNewReservationField(field)) {
        form.setError(field, { type: 'server', message });
        shownOnFields += 1;
      }
    });
    if (shownOnFields === 0) {
      setSubmitError(toCreateReservationError(error));
    }
  };

  const handlePickFreeInterval = (free: FreeSlot) => {
    const { start, sfarsit } = form.getValues();
    const durationMs = new Date(sfarsit).getTime() - new Date(start).getTime();
    const interval = fitToFreeInterval(free, Number.isNaN(durationMs) ? 0 : durationMs);
    form.setValue('start', toDateTimeInput(interval.start), { shouldValidate: true });
    form.setValue('sfarsit', toDateTimeInput(interval.end), { shouldValidate: true });
    setSubmitError(undefined);
  };

  return (
    <>
      <DialogContent>
        <Stack
          component="form"
          id="new-reservation-form"
          noValidate
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 1 }}
        >
          {submitError && (
            <CreateReservationErrorAlert
              error={submitError}
              onPickFreeInterval={handlePickFreeInterval}
            />
          )}
          <NewReservationFields form={form} grants={grants} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Renunță
        </Button>
        <Button
          type="submit"
          form="new-reservation-form"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size="1em" color="inherit" /> : undefined}
        >
          Trimite cererea
        </Button>
      </DialogActions>
    </>
  );
}
