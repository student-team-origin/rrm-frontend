import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

/** Vizualizările FullCalendar oferite în calendar. */
export type CalendarView = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

/** Butoanele barei au textul ca în wireframe, nu cu majuscule. */
const BUTTON_SX = { textTransform: 'none', minWidth: 0, px: 1.5 } as const;

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'timeGridDay', label: 'Zi' },
  { value: 'timeGridWeek', label: 'Săptămână' },
  { value: 'dayGridMonth', label: 'Lună' },
];

export type CalendarToolbarProps = {
  /** Perioada afișată, ex. „13 – 19 octombrie 2026”. */
  title: string;
  view: CalendarView | undefined;
  /** Perioada afișată conține ziua de azi (butonul „Azi” nu mai are efect). */
  showsToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
};

/**
 * Bara de deasupra calendarului: navigarea între perioade și „Azi” cu perioada afișată, în stânga,
 * și alegerea vizualizării (zi / săptămână / lună), în dreapta. Pe mobil, cele două se așază una
 * sub alta.
 */
export function CalendarToolbar({
  title,
  view,
  showsToday,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ mb: 2, justifyContent: 'space-between', alignItems: { md: 'center' } }}
    >
      <Stack
        direction="row"
        useFlexGap
        sx={{ alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1 }}
      >
        <Button
          variant="outlined"
          size="small"
          aria-label="Perioada anterioară"
          onClick={onPrev}
          sx={BUTTON_SX}
        >
          <ChevronLeftIcon fontSize="small" />
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onToday}
          disabled={showsToday}
          sx={BUTTON_SX}
        >
          Azi
        </Button>
        <Button
          variant="outlined"
          size="small"
          aria-label="Perioada următoare"
          onClick={onNext}
          sx={BUTTON_SX}
        >
          <ChevronRightIcon fontSize="small" />
        </Button>
        <Typography
          variant="h6"
          component="h2"
          aria-live="polite"
          sx={{ flexBasis: { xs: '100%', sm: 'auto' }, pl: { sm: 1 } }}
        >
          {title}
        </Typography>
      </Stack>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        aria-label="Vizualizare"
        value={view ?? null}
        onChange={(_, value: CalendarView | null) => value && onViewChange(value)}
        sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}
      >
        {VIEW_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value} sx={{ ...BUTTON_SX, px: 2 }}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
