import { Chip } from '@mui/material';
import { resourceStatusColors, resourceStatusLabels } from '../../../theme';
import type { ResourceStatus } from '../types';

export type ResourceStatusChipProps = {
  status: ResourceStatus;
};

/** Starea unei resurse ca Chip colorat, cu culorile și etichetele din `theme.ts`. */
export function ResourceStatusChip({ status }: ResourceStatusChipProps) {
  const color = resourceStatusColors[status];
  return (
    <Chip
      label={resourceStatusLabels[status]}
      size="small"
      sx={{
        bgcolor: color,
        color: (theme) => theme.palette.getContrastText(color),
        fontWeight: 'fontWeightMedium',
      }}
    />
  );
}
