import { MenuItem, Stack, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';
import { resourceStatusLabels } from '../../../theme';
import type { Laboratory, Resource } from '../types';

/** Valoarea opțiunii „Toate laboratoarele” din selector. */
const ALL_LABS = '';

export type CalendarFiltersProps = {
  /** Resursele din laboratorul ales (sau toate). */
  resources: Resource[];
  labs: Laboratory[];
  resourceId: number | undefined;
  labId: number | undefined;
  resourcesLoading: boolean;
  onResourceChange: (resourceId: number) => void;
  onLabChange: (labId: number | undefined) => void;
};

/** Selectoarele paginii Calendar: resursa afișată și laboratorul după care se filtrează lista. */
export function CalendarFilters({
  resources,
  labs,
  resourceId,
  labId,
  resourcesLoading,
  onResourceChange,
  onLabChange,
}: CalendarFiltersProps) {
  // Valoarea selectorului e goală până sosesc opțiunile, ca MUI să nu primească o valoare
  // inexistentă.
  const resourceValue = resources.some((resource) => resource.id === resourceId)
    ? String(resourceId)
    : '';
  const labValue = labs.some((lab) => lab.id === labId) ? String(labId) : ALL_LABS;

  const handleLabChange = (event: ChangeEvent<HTMLInputElement>) =>
    onLabChange(event.target.value === ALL_LABS ? undefined : Number(event.target.value));

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField
        select
        label="Resursă"
        size="small"
        value={resourceValue}
        onChange={(event) => onResourceChange(Number(event.target.value))}
        disabled={resourcesLoading}
        sx={{ minWidth: { sm: 280 } }}
      >
        {resources.map((resource) => (
          <MenuItem key={resource.id} value={String(resource.id)}>
            {resource.stare && resource.stare !== 'Activa'
              ? `${resource.denumire} (${resourceStatusLabels[resource.stare]})`
              : resource.denumire}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Laborator"
        size="small"
        value={labValue}
        onChange={handleLabChange}
        sx={{ minWidth: { sm: 220 } }}
        slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
      >
        <MenuItem value={ALL_LABS}>Toate laboratoarele</MenuItem>
        {labs.map((lab) => (
          <MenuItem key={lab.id} value={String(lab.id)}>
            {lab.denumire}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
