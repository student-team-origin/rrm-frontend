import { Chip } from '@mui/material';
import { reservationStatusColors, reservationStatusLabels } from '../../../theme';
import type { ReservationStatus } from '../types';

export type ReservationStatusChipProps = {
  status: ReservationStatus;
};

/** Starea unei rezervări ca Chip colorat, cu culorile și etichetele din `theme.ts`. */
export function ReservationStatusChip({ status }: ReservationStatusChipProps) {
  const color = reservationStatusColors[status];
  return (
    <Chip
      label={reservationStatusLabels[status]}
      size="small"
      sx={{
        bgcolor: color,
        color: (theme) => theme.palette.getContrastText(color),
        fontWeight: 'fontWeightMedium',
      }}
    />
  );
}
