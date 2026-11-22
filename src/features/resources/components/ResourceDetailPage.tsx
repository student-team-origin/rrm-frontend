import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Alert, Button, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getHttpStatus, toApiError } from '../../../api/client';
import { useLabs } from '../hooks/useLabs';
import { useResource } from '../hooks/useResource';
import { parseResourceId } from '../utils/resourcePaths';
import { AvailabilityLegend } from './AvailabilityLegend';
import { ResourceAvailabilityPanel } from './ResourceAvailabilityPanel';
import { ResourceDetails } from './ResourceDetails';
import { ResourceStatusChip } from './ResourceStatusChip';

/** Mesajul pentru o resursă inexistentă (id greșit în URL sau resursă ștearsă). */
const NOT_FOUND_TEXT = 'Resursa nu există sau a fost ștearsă.';

/**
 * Pagina „Detaliu resursă” (`/resources/:resourceId`): datele resursei și calendarul ei de
 * disponibilitate. Butonul „Rezervă” apare doar pentru o resursă activă; formularul de rezervare
 * se leagă de el în TO-42.
 */
export function ResourceDetailPage() {
  const resourceId = parseResourceId(useParams().resourceId);
  const resourceQuery = useResource(resourceId);
  const labs = useLabs();

  const resource = resourceQuery.data;
  const laboratory = labs.data?.find((lab) => lab.id === resource?.laboratorId);
  const isNotFound = resourceId === undefined || getHttpStatus(resourceQuery.error) === 404;

  const backLink = (
    <Button
      component={RouterLink}
      to="/resources"
      size="small"
      startIcon={<ArrowBackIcon />}
      sx={{ mb: 2 }}
    >
      Catalog resurse
    </Button>
  );

  if (isNotFound) {
    return (
      <>
        {backLink}
        <Alert severity="warning">{NOT_FOUND_TEXT}</Alert>
      </>
    );
  }
  if (resourceQuery.isError) {
    return (
      <>
        {backLink}
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => resourceQuery.refetch()}>
              Reîncearcă
            </Button>
          }
        >
          Resursa nu a putut fi încărcată. {toApiError(resourceQuery.error).message}
        </Alert>
      </>
    );
  }
  if (!resource) {
    return (
      <>
        {backLink}
        <LinearProgress aria-label="Se încarcă resursa" />
      </>
    );
  }

  return (
    <>
      {backLink}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1">
            {resource.denumire}
          </Typography>
          {resource.stare && <ResourceStatusChip status={resource.stare} />}
        </Stack>
        {resource.stare === 'Activa' && (
          // Formularul de rezervare vine în TO-42; până atunci butonul e inactiv. Tooltip-ul are
          // nevoie de un element activ, de aceea butonul e înfășurat într-un <span>.
          <Tooltip title="Formularul de rezervare va fi disponibil în curând.">
            <span>
              <Button variant="contained" startIcon={<EventAvailableIcon />} disabled>
                Rezervă
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>

      <ResourceDetails resource={resource} laboratory={laboratory} />

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Disponibilitate
      </Typography>
      <ResourceAvailabilityPanel resourceId={resourceId} resource={resource} />
      <AvailabilityLegend />
    </>
  );
}
