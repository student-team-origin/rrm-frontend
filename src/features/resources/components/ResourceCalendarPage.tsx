import { Alert, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useLabs } from '../hooks/useLabs';
import { useResource } from '../hooks/useResource';
import { useResourcePicker } from '../hooks/useResourcePicker';
import { parseResourceId } from '../utils/resourcePaths';
import { AvailabilityLegend } from './AvailabilityLegend';
import { CalendarFilters } from './CalendarFilters';
import { ResourceAvailabilityPanel } from './ResourceAvailabilityPanel';

/** Parametrii din URL (resursa afișată și laboratorul), ca linkul spre calendar să poată fi trimis. */
const RESOURCE_SEARCH_PARAM = 'resursaId';
const LAB_SEARCH_PARAM = 'laboratorId';

/**
 * Pagina „Calendar disponibilitate”: intervalele în care o resursă este ocupată, pe zi, săptămână
 * sau lună, colorate după starea rezervării, cu timpul de pregătire afișat separat.
 */
export function ResourceCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceId = parseResourceId(searchParams.get(RESOURCE_SEARCH_PARAM));
  const labId = parseResourceId(searchParams.get(LAB_SEARCH_PARAM));
  const labs = useLabs();
  const resource = useResource(resourceId).data;
  const picker = useResourcePicker(labId, resource);

  const updateSearchParams = (update: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    update(next);
    setSearchParams(next);
  };
  const handleResourceChange = (id: number | undefined) =>
    updateSearchParams((params) =>
      id === undefined
        ? params.delete(RESOURCE_SEARCH_PARAM)
        : params.set(RESOURCE_SEARCH_PARAM, String(id)),
    );
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
          resources={picker.options}
          selectedResource={resource}
          totalResources={picker.total}
          shownResources={picker.shown}
          resourcesLoading={picker.isLoading}
          labs={labs.data ?? []}
          labId={labId}
          onResourceSearch={picker.search}
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
