import { Alert, Button, LinearProgress, Paper, Stack, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toApiError } from '../../../api/client';
import { useLabs } from '../hooks/useLabs';
import { useResourceAvailability } from '../hooks/useResourceAvailability';
import { useResources } from '../hooks/useResources';
import type { AvailabilityRange } from '../types';
import {
  eventColors,
  toCalendarEvents,
  toUnavailableEvents,
  visibleHours,
} from '../utils/calendarEvents';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { AvailabilityLegend } from './AvailabilityLegend';
import { CalendarFilters } from './CalendarFilters';

/** Parametrii din URL (resursa afișată și laboratorul), ca linkul spre calendar să poată fi trimis. */
const RESOURCE_SEARCH_PARAM = 'resursaId';
const LAB_SEARCH_PARAM = 'laboratorId';

/** Resursele din selector: toate, ordonate după denumire (maximul acceptat de backend). */
const RESOURCE_PICKER_PARAMS = { page: 0, size: 100 };

const UNAVAILABLE_MESSAGES = {
  Mentenanta: 'Resursa este în mentenanță și nu poate fi rezervată până nu redevine activă.',
  Defecta: 'Resursa este defectă și nu poate fi rezervată până nu redevine activă.',
} as const;

function parseId(value: string | null): number | undefined {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : undefined;
}

/**
 * Pagina „Calendar disponibilitate”: intervalele în care o resursă este ocupată, pe zi, săptămână
 * sau lună, colorate după starea rezervării, cu timpul de pregătire afișat separat.
 */
export function ResourceCalendarPage() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceId = parseId(searchParams.get(RESOURCE_SEARCH_PARAM));
  const labId = parseId(searchParams.get(LAB_SEARCH_PARAM));
  const [range, setRange] = useState<AvailabilityRange>();
  const resources = useResources(RESOURCE_PICKER_PARAMS);
  const labs = useLabs();
  const availability = useResourceAvailability(resourceId, range);

  const allResources = resources.data?.items;
  const labResources = useMemo(
    () => (allResources ?? []).filter((resource) => !labId || resource.laboratorId === labId),
    [allResources, labId],
  );
  const resource = allResources?.find((item) => item.id === resourceId);
  const intervals = availability.data;
  const events = useMemo(
    () => [
      ...toCalendarEvents(intervals ?? [], resource?.timpPregatireMin ?? 0, eventColors(theme)),
      ...toUnavailableEvents(resource?.stare, range, new Date()),
    ],
    [intervals, resource?.timpPregatireMin, resource?.stare, range, theme],
  );
  const hours = useMemo(() => visibleHours(intervals ?? []), [intervals]);

  const updateSearchParams = (update: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    update(next);
    setSearchParams(next);
  };
  const handleResourceChange = (id: number) =>
    updateSearchParams((params) => params.set(RESOURCE_SEARCH_PARAM, String(id)));
  const handleLabChange = (id: number | undefined) =>
    updateSearchParams((params) => {
      if (id === undefined) {
        params.delete(LAB_SEARCH_PARAM);
        return;
      }
      params.set(LAB_SEARCH_PARAM, String(id));
      // Resursa afișată rămâne doar dacă aparține laboratorului ales.
      if (resource && resource.laboratorId !== id) {
        params.delete(RESOURCE_SEARCH_PARAM);
      }
    });

  return (
    <>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ mb: 3, justifyContent: 'space-between', alignItems: { lg: 'center' } }}
      >
        <div>
          <Typography variant="h4" component="h1">
            Calendar disponibilitate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verifică intervalele libere înainte de a trimite o cerere
          </Typography>
        </div>
        <CalendarFilters
          resources={labResources}
          labs={labs.data ?? []}
          resourceId={resourceId}
          labId={labId}
          resourcesLoading={resources.isPending}
          onResourceChange={handleResourceChange}
          onLabChange={handleLabChange}
        />
      </Stack>

      {resourceId === undefined ? (
        <Alert severity="info">Alege o resursă pentru a-i vedea calendarul.</Alert>
      ) : (
        <>
          {resource?.stare && resource.stare !== 'Activa' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {UNAVAILABLE_MESSAGES[resource.stare]}
            </Alert>
          )}
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
            sx={{ position: 'relative', p: { xs: 1, md: 2 }, mb: 2 }}
          >
            {availability.isFetching && (
              <LinearProgress
                aria-label="Se încarcă disponibilitatea"
                sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
              />
            )}
            <AvailabilityCalendar events={events} hours={hours} onRangeChange={setRange} />
          </Paper>
        </>
      )}
      <AvailabilityLegend />
    </>
  );
}
