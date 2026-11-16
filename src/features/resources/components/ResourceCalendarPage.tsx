import {
  Alert,
  Button,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toApiError } from '../../../api/client';
import { resourceStatusLabels } from '../../../theme';
import { ReservationStatusChip } from '../../reservations/components/ReservationStatusChip';
import { useResourceAvailability } from '../hooks/useResourceAvailability';
import { useResources } from '../hooks/useResources';
import type { AvailabilityRange } from '../types';
import { OCCUPYING_STATUSES, toCalendarEvents } from '../utils/calendarEvents';
import { AvailabilityCalendar } from './AvailabilityCalendar';

/** Parametrul din URL cu resursa afișată, ca linkul spre calendar să poată fi trimis. */
const RESOURCE_SEARCH_PARAM = 'resursaId';

/** Resursele din selector: toate, ordonate după denumire (maximul acceptat de backend). */
const RESOURCE_PICKER_PARAMS = { page: 0, size: 100 };

function parseResourceId(value: string | null): number | undefined {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : undefined;
}

/**
 * Pagina „Calendar resurse”: intervalele în care o resursă este ocupată, pe zi, săptămână sau lună,
 * colorate după starea rezervării.
 */
export function ResourceCalendarPage() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceId = parseResourceId(searchParams.get(RESOURCE_SEARCH_PARAM));
  const [range, setRange] = useState<AvailabilityRange>();
  const resources = useResources(RESOURCE_PICKER_PARAMS);
  const availability = useResourceAvailability(resourceId, range);
  const events = useMemo(
    () =>
      toCalendarEvents(availability.data ?? [], (color) => theme.palette.getContrastText(color)),
    [availability.data, theme],
  );

  const handleResourceChange = (event: ChangeEvent<HTMLInputElement>) =>
    setSearchParams({ [RESOURCE_SEARCH_PARAM]: event.target.value });

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="h4" component="h1">
          Calendar resurse
        </Typography>
        <TextField
          select
          label="Resursă"
          size="small"
          value={resources.data && resourceId !== undefined ? String(resourceId) : ''}
          onChange={handleResourceChange}
          disabled={resources.isPending}
          sx={{ minWidth: { sm: 320 } }}
        >
          {(resources.data?.items ?? []).map((resource) => (
            <MenuItem key={resource.id} value={String(resource.id)}>
              {resource.stare && resource.stare !== 'Activa'
                ? `${resource.denumire} (${resourceStatusLabels[resource.stare]})`
                : resource.denumire}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
        {OCCUPYING_STATUSES.map((status) => (
          <ReservationStatusChip key={status} status={status} />
        ))}
      </Stack>

      {resourceId === undefined ? (
        <Alert severity="info">Alege o resursă pentru a-i vedea calendarul.</Alert>
      ) : (
        <>
          {availability.isError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => availability.refetch()}>
                  Reîncearcă
                </Button>
              }
            >
              Disponibilitatea nu a putut fi încărcată. {toApiError(availability.error).message}
            </Alert>
          )}
          <Paper
            component="section"
            aria-label="Calendarul resursei"
            variant="outlined"
            sx={{ position: 'relative', p: { xs: 1, md: 2 } }}
          >
            {availability.isFetching && (
              <LinearProgress
                aria-label="Se încarcă disponibilitatea"
                sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
              />
            )}
            <AvailabilityCalendar events={events} onRangeChange={setRange} />
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Intervalele ocupate includ timpul de pregătire al resursei dintre rezervări.
          </Typography>
        </>
      )}
    </>
  );
}
