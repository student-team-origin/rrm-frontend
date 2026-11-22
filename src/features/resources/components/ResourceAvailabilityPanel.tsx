import { Alert, Button, LinearProgress, Paper, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { toApiError } from '../../../api/client';
import { useNow } from '../hooks/useNow';
import { useResourceAvailability } from '../hooks/useResourceAvailability';
import type { AvailabilityRange, Resource } from '../types';
import {
  eventColors,
  toCalendarEvents,
  toUnavailableEvents,
  visibleHours,
} from '../utils/calendarEvents';
import { AvailabilityCalendar } from './AvailabilityCalendar';

const UNAVAILABLE_MESSAGES = {
  Mentenanta: 'Resursa este în mentenanță și nu poate fi rezervată până nu redevine activă.',
  Defecta: 'Resursa este defectă și nu poate fi rezervată până nu redevine activă.',
} as const;

export type ResourceAvailabilityPanelProps = {
  resourceId: number;
  /** Resursa afișată, dacă e deja încărcată (pentru timpul de pregătire și stare). */
  resource: Resource | undefined;
  /** Dacă e dat, un interval liber selectat în calendar deschide formularul de rezervare. */
  onSelectInterval?: (interval: { start: Date; end: Date }) => void;
};

/**
 * Calendarul de disponibilitate al unei resurse: intervalele ocupate în perioada afișată, colorate
 * după starea rezervării, cu timpul de pregătire separat. Afișează și avertismentul pentru o
 * resursă indisponibilă, eroarea de încărcare și mesajul pentru o perioadă fără rezervări.
 */
export function ResourceAvailabilityPanel({
  resourceId,
  resource,
  onSelectInterval,
}: ResourceAvailabilityPanelProps) {
  const theme = useTheme();
  const [range, setRange] = useState<AvailabilityRange>();
  const availability = useResourceAvailability(resourceId, range);
  const now = useNow();

  const intervals = availability.data;
  const events = useMemo(
    () => [
      ...toCalendarEvents(intervals ?? [], resource?.timpPregatireMin ?? 0, eventColors(theme)),
      ...toUnavailableEvents(resource?.stare, range, now),
    ],
    [intervals, resource?.timpPregatireMin, resource?.stare, range, theme, now],
  );
  const hours = useMemo(() => visibleHours(intervals ?? []), [intervals]);
  const hasNoReservations =
    availability.isSuccess && !availability.isPlaceholderData && availability.data.length === 0;

  return (
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
        <AvailabilityCalendar
          events={events}
          hours={hours}
          onRangeChange={setRange}
          onSelect={onSelectInterval}
        />
        {hasNoReservations && (
          <Typography role="status" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nicio rezervare în perioada afișată.
          </Typography>
        )}
      </Paper>
    </>
  );
}
