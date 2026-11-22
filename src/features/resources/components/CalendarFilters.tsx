import { Autocomplete, MenuItem, Stack, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';
import { resourceStatusLabels } from '../../../theme';
import type { Laboratory, Resource } from '../types';

/** Valoarea opțiunii „Toate laboratoarele” din selector. */
const ALL_LABS = '';

/** Denumirea resursei, cu starea în paranteză dacă nu e activă. */
function resourceLabel(resource: Resource): string {
  const name = resource.denumire ?? '';
  return resource.stare && resource.stare !== 'Activa'
    ? `${name} (${resourceStatusLabels[resource.stare]})`
    : name;
}

export type CalendarFiltersProps = {
  /** Resursele găsite pe server pentru căutarea și laboratorul curente (plus cea aleasă). */
  resources: Resource[];
  /** Resursa afișată în calendar, dacă a fost aleasă și s-a încărcat. */
  selectedResource: Resource | undefined;
  /** Câte resurse se potrivesc în total; dacă sunt mai multe decât cele afișate, apare un indiciu. */
  totalResources: number;
  /** Câte dintre ele sunt în listă. */
  shownResources: number;
  resourcesLoading: boolean;
  labs: Laboratory[];
  labId: number | undefined;
  onResourceSearch: (text: string) => void;
  onResourceChange: (resourceId: number | undefined) => void;
  onLabChange: (labId: number | undefined) => void;
};

/**
 * Selectoarele paginii Calendar: resursa afișată (cu căutare pe server, deci orice resursă poate
 * fi găsită) și laboratorul după care se filtrează lista.
 */
export function CalendarFilters({
  resources,
  selectedResource,
  totalResources,
  shownResources,
  resourcesLoading,
  labs,
  labId,
  onResourceSearch,
  onResourceChange,
  onLabChange,
}: CalendarFiltersProps) {
  const labValue = labs.some((lab) => lab.id === labId) ? String(labId) : ALL_LABS;
  const hint =
    totalResources > shownResources
      ? `Se afișează ${shownResources} din ${totalResources}. Scrie pentru a căuta.`
      : undefined;

  const handleLabChange = (event: ChangeEvent<HTMLInputElement>) =>
    onLabChange(event.target.value === ALL_LABS ? undefined : Number(event.target.value));
  const handleResourceChange = (resource: Resource | null) => {
    // După alegere, lista revine la primele resurse, nu la ultima căutare.
    onResourceSearch('');
    onResourceChange(resource?.id);
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Autocomplete
        options={resources}
        value={selectedResource ?? null}
        onChange={(_, resource) => handleResourceChange(resource)}
        onInputChange={(_, text, reason) => reason === 'input' && onResourceSearch(text)}
        // Căutarea se face pe server; lista primită se afișează ca atare.
        filterOptions={(options) => options}
        getOptionLabel={resourceLabel}
        getOptionKey={(resource) => resource.id ?? resourceLabel(resource)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={resourcesLoading}
        loadingText="Se caută..."
        noOptionsText="Nicio resursă găsită"
        size="small"
        sx={{ width: { xs: '100%', sm: 280 } }}
        renderInput={(params) => <TextField {...params} label="Resursă" helperText={hint} />}
      />
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
