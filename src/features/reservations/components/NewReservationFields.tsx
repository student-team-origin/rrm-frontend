import { MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { PURPOSE_MAX_LENGTH, type NewReservationValues } from '../schemas';
import type { Grant } from '../types';
import { durationHours, formatHours } from '../utils/formatHours';

export type NewReservationFieldsProps = {
  form: UseFormReturn<NewReservationValues>;
  grants: Grant[];
};

/** Câmpurile formularului „Rezervare nouă”: intervalul, grantul (cu orele rămase) și scopul. */
export function NewReservationFields({ form, grants }: NewReservationFieldsProps) {
  const { errors } = form.formState;
  const [start, end, grantId] = useWatch({
    control: form.control,
    name: ['start', 'sfarsit', 'grantId'],
  });
  const duration = durationHours(start, end);
  const grant = grants.find((g) => String(g.id) === grantId);
  const exceedsBalance =
    duration !== undefined && grant?.oreRamase !== undefined && duration > grant.oreRamase;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Început"
          type="datetime-local"
          required
          fullWidth
          {...form.register('start')}
          error={errors.start !== undefined}
          helperText={errors.start?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Sfârșit"
          type="datetime-local"
          required
          fullWidth
          {...form.register('sfarsit')}
          error={errors.sfarsit !== undefined}
          helperText={
            errors.sfarsit?.message ??
            (duration !== undefined ? `Durata: ${formatHours(duration)}` : undefined)
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
      <Controller
        name="grantId"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            select
            label="Grant"
            required
            {...field}
            error={fieldState.error !== undefined}
            helperText={
              fieldState.error?.message ??
              (exceedsBalance
                ? `Rezervarea necesită ${formatHours(duration)}, dar grantul mai are doar ${formatHours(grant?.oreRamase ?? 0)}.`
                : undefined)
            }
          >
            {grants.map((g) => (
              <MenuItem key={g.id} value={String(g.id)}>
                {g.cod} · {formatHours(g.oreRamase ?? 0)} rămase
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        label="Scopul rezervării"
        required
        multiline
        minRows={3}
        {...form.register('scop')}
        error={errors.scop !== undefined}
        helperText={errors.scop?.message ?? 'Pentru ce folosești resursa; îl văd aprobatorii.'}
        // Cu 1 peste limită: cine depășește limita vede mesajul de validare.
        slotProps={{ htmlInput: { maxLength: PURPOSE_MAX_LENGTH + 1 } }}
      />
    </>
  );
}
