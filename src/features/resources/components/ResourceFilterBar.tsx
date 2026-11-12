import SearchIcon from '@mui/icons-material/Search';
import { Button, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';
import { resourceStatusLabels } from '../../../theme';
import type { Laboratory, ResourceCategory, ResourceFilters, ResourceStatus } from '../types';

const ALL = '';
const STATUSES = Object.keys(resourceStatusLabels) as ResourceStatus[];

export type ResourceFilterBarProps = {
  searchText: string;
  filters: ResourceFilters;
  categories: ResourceCategory[];
  labs: Laboratory[];
  canReset: boolean;
  onSearchChange: (text: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  onLabChange: (labId: number | undefined) => void;
  onStatusChange: (status: ResourceStatus | undefined) => void;
  onReset: () => void;
};

function toId(event: ChangeEvent<HTMLInputElement>): number | undefined {
  return event.target.value === ALL ? undefined : Number(event.target.value);
}

function isStatus(value: string): value is ResourceStatus {
  return (STATUSES as string[]).includes(value);
}

/** Bara de filtre a catalogului: căutare text, categorie, laborator, stare și resetare. */
export function ResourceFilterBar({
  searchText,
  filters,
  categories,
  labs,
  canReset,
  onSearchChange,
  onCategoryChange,
  onLabChange,
  onStatusChange,
  onReset,
}: ResourceFilterBarProps) {
  const handleStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    onStatusChange(isStatus(value) ? value : undefined);
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ mb: 2, alignItems: { md: 'center' } }}
    >
      <TextField
        label="Caută"
        placeholder="Denumire sau specificații"
        size="small"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        sx={{ flex: { md: 2 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        label="Categorie"
        size="small"
        value={filters.categorieId ?? ALL}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onCategoryChange(toId(event))}
        sx={{ flex: { md: 1 } }}
      >
        <MenuItem value={ALL}>Toate</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.denumire}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Laborator"
        size="small"
        value={filters.laboratorId ?? ALL}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onLabChange(toId(event))}
        sx={{ flex: { md: 1 } }}
      >
        <MenuItem value={ALL}>Toate</MenuItem>
        {labs.map((lab) => (
          <MenuItem key={lab.id} value={lab.id}>
            {lab.denumire}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Stare"
        size="small"
        value={filters.stare ?? ALL}
        onChange={handleStatusChange}
        sx={{ flex: { md: 1 } }}
      >
        <MenuItem value={ALL}>Toate</MenuItem>
        {STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {resourceStatusLabels[status]}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" onClick={onReset} disabled={!canReset}>
        Resetează
      </Button>
    </Stack>
  );
}
