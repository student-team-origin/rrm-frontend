import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Alert, Button, LinearProgress, Snackbar, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getHttpStatus, toApiError } from '../../../api/client';
import { NewReservationDialog } from '../../reservations/components/NewReservationDialog';
import type { ReservationDraft } from '../../reservations/components/NewReservationForm';
import { useLabs } from '../hooks/useLabs';
import { useResource } from '../hooks/useResource';
import { parseResourceId } from '../utils/resourcePaths';
import { AvailabilityLegend } from './AvailabilityLegend';
import { ResourceAvailabilityPanel } from './ResourceAvailabilityPanel';
import { ResourceDetails } from './ResourceDetails';
import { ResourceStatusChip } from './ResourceStatusChip';

/** Mesajul pentru o resursă inexistentă (id greșit în URL sau resursă ștearsă). */
const NOT_FOUND_TEXT = 'Resursa nu există sau a fost ștearsă.';

/** Confirmarea după trimiterea unei cereri de rezervare. */
const CREATED_TEXT = 'Cererea a fost trimisă și așteaptă aprobarea.';

/**
 * Pagina „Detaliu resursă” (`/resources/:resourceId`): datele resursei și calendarul ei de
 * disponibilitate. Pentru o resursă activă, butonul „Rezervă” sau un interval liber selectat în
 * calendar deschide dialogul „Rezervare nouă”.
 */
export function ResourceDetailPage() {
  const resourceId = parseResourceId(useParams().resourceId);
  const resourceQuery = useResource(resourceId);
  const labs = useLabs();
  const [draft, setDraft] = useState<ReservationDraft>();
  const [createdOpen, setCreatedOpen] = useState(false);

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

  const isBookable = resource.stare === 'Activa';

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
        {isBookable && (
          <Button
            variant="contained"
            startIcon={<EventAvailableIcon />}
            onClick={() => setDraft({})}
          >
            Rezervă
          </Button>
        )}
      </Stack>

      <ResourceDetails resource={resource} laboratory={laboratory} />

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Disponibilitate
      </Typography>
      {isBookable && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selectează în calendar un interval liber ca să-l rezervi.
        </Typography>
      )}
      <ResourceAvailabilityPanel
        resourceId={resourceId}
        resource={resource}
        onSelectInterval={isBookable ? setDraft : undefined}
      />
      <AvailabilityLegend />

      {draft && (
        <NewReservationDialog
          resourceId={resourceId}
          resourceName={resource.denumire ?? `Resursa #${resourceId}`}
          draft={draft}
          onClose={() => setDraft(undefined)}
          onCreated={() => {
            setDraft(undefined);
            setCreatedOpen(true);
          }}
        />
      )}
      <Snackbar
        open={createdOpen}
        autoHideDuration={8000}
        onClose={() => setCreatedOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCreatedOpen(false)}
          action={
            <Button color="inherit" size="small" component={RouterLink} to="/reservations">
              Rezervările mele
            </Button>
          }
        >
          {CREATED_TEXT}
        </Alert>
      </Snackbar>
    </>
  );
}
