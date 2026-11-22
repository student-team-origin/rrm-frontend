import type {
  DateSelectArg,
  DatesSetArg,
  DayHeaderContentArg,
  EventInput,
} from '@fullcalendar/core';
import roLocale from '@fullcalendar/core/locales/ro';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import type { AvailabilityRange } from '../types';
import { EVENT_CLASS, type VisibleHours } from '../utils/calendarEvents';
import { CalendarEventContent } from './CalendarEventContent';
import { CalendarToolbar, type CalendarView } from './CalendarToolbar';

const PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin];
const TIME_FORMAT = { hour: '2-digit', minute: '2-digit', hour12: false } as const;
const FULL_DATE = { day: 'numeric', month: 'long', year: 'numeric' } as const;
const VIEW_OPTIONS = {
  // „Săptămână” înseamnă 7 zile începând de azi, nu săptămâna calendaristică: duminica, aceasta
  // ar fi aproape toată în trecut și rezervările următoare nu s-ar vedea fără „înainte”.
  timeGridWeek: {
    duration: { days: 7 },
    titleFormat: FULL_DATE,
    dayHeaderFormat: { weekday: 'short', day: 'numeric' },
  },
  timeGridDay: { titleFormat: { ...FULL_DATE, weekday: 'long' } },
  // Pe lună nu se văd orele, deci intervalul de rezervat se alege doar pe zi sau pe săptămână.
  dayGridMonth: { selectable: false },
} as const;

/** Pe ecranele tactile, cât timp se ține apăsat până începe selecția (implicit 1 s). */
const LONG_PRESS_DELAY_MS = 300;

type DisplayedPeriod = { title: string; view: CalendarView; showsToday: boolean };

export type AvailabilityCalendarProps = {
  events: EventInput[];
  /** Orele afișate în vizualizarea pe zi și pe săptămână. */
  hours: VisibleHours;
  /** Apelat când se schimbă intervalul afișat (navigare sau altă vizualizare). */
  onRangeChange: (range: AvailabilityRange) => void;
  /**
   * Dacă e dat, utilizatorul poate selecta cu mouse-ul (sau ținând apăsat, pe mobil) un interval
   * liber din viitor, pentru o rezervare nouă.
   */
  onSelect?: (interval: { start: Date; end: Date }) => void;
};

/**
 * Calendarul FullCalendar al unei resurse, cu vizualizare pe zi, săptămână și lună și bara de
 * navigare proprie. Pe ecrane mici pornește pe zi. Săptămâna are 7 zile începând de azi. În vizualizarea pe lună, timpul de pregătire nu
 * se mai afișează separat. Cu `onSelect`, pe zi și pe săptămână se poate selecta un interval liber.
 */
export function AvailabilityCalendar({
  events,
  hours,
  onRangeChange,
  onSelect,
}: AvailabilityCalendarProps) {
  const theme = useTheme();
  // `noSsr`: valoarea corectă de la prima randare, pentru că FullCalendar citește `initialView`
  // doar la montare.
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const calendarRef = useRef<FullCalendar>(null);
  const [period, setPeriod] = useState<DisplayedPeriod>();
  const calendarApi = () => calendarRef.current?.getApi();

  const visibleEvents = useMemo(
    () =>
      period?.view === 'dayGridMonth'
        ? events.filter((event) => event.extendedProps?.kind !== 'buffer')
        : events,
    [events, period?.view],
  );

  const handleDatesSet = ({ view, start, end }: DatesSetArg) => {
    const now = new Date();
    setPeriod({
      title: view.title,
      view: view.type as CalendarView,
      showsToday: now >= view.currentStart && now < view.currentEnd,
    });
    onRangeChange({ from: start.toISOString(), to: end.toISOString() });
  };

  const handleSelect = ({ start, end }: DateSelectArg) => {
    calendarApi()?.unselect();
    onSelect?.({ start, end });
  };

  return (
    <Box
      sx={{
        '--fc-border-color': theme.palette.divider,
        '--fc-today-bg-color': theme.palette.action.hover,
        '--fc-now-indicator-color': theme.palette.text.primary,
        '--fc-bg-event-opacity': theme.palette.action.disabledOpacity,
        '& .fc .fc-col-header-cell': { bgcolor: 'action.hover', py: 1, fontWeight: 'medium' },
        '& .fc .fc-timegrid-col.fc-day-today': { bgcolor: 'transparent' },
        '& .fc .fc-day-sat:not(.fc-col-header-cell), & .fc .fc-day-sun:not(.fc-col-header-cell)': {
          bgcolor: 'action.hover',
        },
        [`& .fc .${EVENT_CLASS.pending}`]: { borderStyle: 'dashed', borderWidth: 2 },
        [`& .fc .${EVENT_CLASS.buffer}`]: {
          bgcolor: 'background.paper',
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'text.disabled',
          boxShadow: 'none',
        },
      }}
    >
      <CalendarToolbar
        title={period?.title ?? ''}
        view={period?.view}
        showsToday={period?.showsToday ?? false}
        onPrev={() => calendarApi()?.prev()}
        onNext={() => calendarApi()?.next()}
        onToday={() => calendarApi()?.today()}
        onViewChange={(view) => calendarApi()?.changeView(view)}
      />
      <FullCalendar
        ref={calendarRef}
        plugins={PLUGINS}
        locale={roLocale}
        initialView={isDesktop ? 'timeGridWeek' : 'timeGridDay'}
        headerToolbar={false}
        views={VIEW_OPTIONS}
        events={visibleEvents}
        datesSet={handleDatesSet}
        selectable={onSelect !== undefined}
        selectMirror
        // Intervalele ocupate (și timpul de pregătire) nu se pot selecta, nici cele din trecut.
        selectOverlap={false}
        selectAllow={({ start }) => start >= new Date()}
        select={handleSelect}
        selectLongPressDelay={LONG_PRESS_DELAY_MS}
        eventContent={(arg) => <CalendarEventContent arg={arg} />}
        dayHeaderContent={renderDayHeader}
        eventDisplay="block"
        allDaySlot={false}
        nowIndicator
        slotMinTime={hours.slotMinTime}
        slotMaxTime={hours.slotMaxTime}
        height="auto"
        eventTimeFormat={TIME_FORMAT}
        slotLabelFormat={TIME_FORMAT}
      />
    </Box>
  );
}

/**
 * În vizualizarea pe zi și pe săptămână, ziua de azi are în antet eticheta „azi”, în culoarea
 * principală a aplicației (aceeași cu bara de sus).
 */
function renderDayHeader({ text, isToday, view }: DayHeaderContentArg) {
  if (!isToday || view.type === 'dayGridMonth') {
    return text;
  }
  return (
    <Box
      component="span"
      sx={{
        px: 1.25,
        py: 0.25,
        borderRadius: 4,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      {text} · azi
    </Box>
  );
}
