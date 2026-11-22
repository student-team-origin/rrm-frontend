import { Box, Paper, Typography } from '@mui/material';
import type { Laboratory, Resource } from '../types';

/** Textul afișat pentru un câmp necompletat. */
const EMPTY = '—';

export type ResourceDetailsProps = {
  resource: Resource;
  /** Laboratorul resursei, dacă e încărcat (din `GET /labs`). */
  laboratory: Laboratory | undefined;
};

function preparationText(minutes: number | undefined): string {
  return minutes ? `${minutes} min după fiecare rezervare` : 'Fără';
}

/**
 * Datele unei resurse, ca listă etichetă – valoare: categoria, laboratorul și locația, timpul de
 * pregătire, specificațiile și regulile de acces. Pe mobil, eticheta stă deasupra valorii.
 */
export function ResourceDetails({ resource, laboratory }: ResourceDetailsProps) {
  const rows = [
    { label: 'Categorie', value: resource.categorie?.denumire },
    { label: 'Laborator', value: laboratory?.denumire },
    { label: 'Locație', value: laboratory?.locatie },
    { label: 'Timp de pregătire', value: preparationText(resource.timpPregatireMin) },
    { label: 'Specificații', value: resource.specificatii },
    { label: 'Reguli de acces', value: resource.reguliAcces },
  ];

  return (
    <Paper component="section" aria-label="Datele resursei" variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'max-content 1fr' },
          columnGap: 3,
          rowGap: { xs: 0.5, sm: 1.5 },
          m: 0,
        }}
      >
        {rows.map((row) => (
          <Box key={row.label} sx={{ display: 'contents' }}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {row.label}
            </Typography>
            <Typography
              component="dd"
              variant="body2"
              sx={{ m: 0, mb: { xs: 1, sm: 0 }, whiteSpace: 'pre-line' }}
            >
              {row.value || EMPTY}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
