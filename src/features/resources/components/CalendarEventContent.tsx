import type { EventContentArg } from '@fullcalendar/core';
import { Box, Typography } from '@mui/material';
import type { CalendarEventKind } from '../utils/calendarEvents';

export type CalendarEventContentProps = { arg: EventContentArg };

/**
 * Conținutul unui eveniment din calendar. În vizualizarea pe zi și pe săptămână, o rezervare are
 * starea pe primul rând și intervalul orar dedesubt; timpul de pregătire are doar eticheta. În
 * vizualizarea pe lună, totul încape pe un rând.
 */
export function CalendarEventContent({ arg }: CalendarEventContentProps) {
  const { event, timeText, view } = arg;
  const kind = event.extendedProps.kind as CalendarEventKind | undefined;

  if (kind === 'unavailable') {
    return (
      <Typography variant="caption" sx={{ display: 'block', p: 0.5, fontWeight: 'medium' }}>
        {event.title}
      </Typography>
    );
  }
  if (kind === 'buffer') {
    return (
      <Typography
        variant="caption"
        noWrap
        sx={{ display: 'block', px: 0.5, lineHeight: 1.2, color: 'text.secondary' }}
      >
        {event.title}
      </Typography>
    );
  }
  if (view.type === 'dayGridMonth') {
    return (
      <Typography variant="caption" noWrap sx={{ display: 'block', px: 0.5 }}>
        {timeText} {event.title}
      </Typography>
    );
  }
  return (
    <Box sx={{ px: 0.5, overflow: 'hidden' }}>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'medium' }}>
        {event.title}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block' }}>
        {timeText}
      </Typography>
    </Box>
  );
}
