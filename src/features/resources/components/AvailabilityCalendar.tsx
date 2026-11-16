import type { DatesSetArg, EventInput } from '@fullcalendar/core';
import roLocale from '@fullcalendar/core/locales/ro';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import type { AvailabilityRange } from '../types';

const PLUGINS = [dayGridPlugin, timeGridPlugin];
const VIEWS = 'timeGridDay,timeGridWeek,dayGridMonth';
const TIME_FORMAT = { hour: '2-digit', minute: '2-digit', hour12: false } as const;

export type AvailabilityCalendarProps = {
  events: EventInput[];
  /** Apelat când se schimbă intervalul afișat (navigare sau altă vizualizare). */
  onRangeChange: (range: AvailabilityRange) => void;
};

/**
 * Calendarul FullCalendar al unei resurse, cu vizualizare pe zi, săptămână și lună. Pe ecrane mici
 * pornește pe zi, iar butoanele de vizualizare trec sub calendar.
 */
export function AvailabilityCalendar({ events, onRangeChange }: AvailabilityCalendarProps) {
  const theme = useTheme();
  // `noSsr`: valoarea corectă de la prima randare, pentru că FullCalendar citește `initialView`
  // doar la montare.
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

  const handleDatesSet = (arg: DatesSetArg) =>
    onRangeChange({ from: arg.start.toISOString(), to: arg.end.toISOString() });

  return (
    <Box
      sx={{
        '--fc-border-color': theme.palette.divider,
        '--fc-today-bg-color': theme.palette.action.hover,
        '--fc-button-bg-color': theme.palette.primary.main,
        '--fc-button-border-color': theme.palette.primary.main,
        '--fc-button-hover-bg-color': theme.palette.primary.dark,
        '--fc-button-hover-border-color': theme.palette.primary.dark,
        '--fc-button-active-bg-color': theme.palette.primary.dark,
        '--fc-button-active-border-color': theme.palette.primary.dark,
        '& .fc .fc-toolbar-title': { fontSize: theme.typography.h6.fontSize },
      }}
    >
      <FullCalendar
        plugins={PLUGINS}
        locale={roLocale}
        initialView={isDesktop ? 'timeGridWeek' : 'timeGridDay'}
        headerToolbar={
          isDesktop
            ? { left: 'prev,next today', center: 'title', right: VIEWS }
            : { left: 'prev,next', center: 'title', right: 'today' }
        }
        footerToolbar={isDesktop ? false : { center: VIEWS }}
        events={events}
        datesSet={handleDatesSet}
        allDaySlot={false}
        nowIndicator
        scrollTime="08:00:00"
        height="auto"
        eventTimeFormat={TIME_FORMAT}
        slotLabelFormat={TIME_FORMAT}
      />
    </Box>
  );
}
