import { Alert, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLabs } from '../hooks/useLabs';
import { useResources } from '../hooks/useResources';
import { parseResourceId } from '../utils/resourcePaths';
import { AvailabilityLegend } from './AvailabilityLegend';
import { CalendarFilters } from './CalendarFilters';
import { ResourceAvailabilityPanel } from './ResourceAvailabilityPanel';

/** Parametrii din URL (resursa afișată și laboratorul), ca linkul spre calendar să poată fi trimis. */
const RESOURCE_SEARCH_PARAM = 'resursaId';
const LAB_SEARCH_PARAM = 'laboratorId';

/** Resursele din selector: toate, ordonate după denumire (maximul acceptat de backend). */
const RESOURCE_PICKER_PARAMS = { page: 0, size: 100 };

/**
 * Pagina „Calendar disponibilitate”: intervalele în care o resursă este ocupată, pe zi, săptămână
 * sau lună, colorate după starea rezervării, cu timpul de pregătire afișat separat.
 */
export function ResourceCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceId = parseResourceId(searchParams.get(RESOURCE_SEARCH_PARAM));
  const labId = parseResourceId(searchParams.get(LAB_SEARCH_PARAM));
  const resources = useResources(RESOURCE_PICKER_PARAMS);
  const labs = useLabs();

  const allResources = resources.data?.items;
  const labResources = useMemo(
    () => (allResources ?? []).filter((resource) => !labId || resource.laboratorId === labId),
    [allResources, labId],
  );
  const resource = allResources?.find((item) => item.id === resourceId);

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
        <ResourceAvailabilityPanel resourceId={resourceId} resource={resource} />
      )}
      <AvailabilityLegend />
    </>
  );
}
