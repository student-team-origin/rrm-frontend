import { Box, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  reservationStatusColors,
  reservationStatusLabels,
  resourceStatusColors,
} from '../../../theme';
import type { ResourceStatus } from '../types';
import {
  BUFFER_LABEL,
  eventColors,
  OCCUPYING_STATUSES,
  PENDING_STATUSES,
} from '../utils/calendarEvents';

type LegendItem = { label: string; swatch: SxProps<Theme> };

/** Stările în care resursa nu poate fi rezervată, cu eticheta lor din legendă. */
const UNAVAILABLE_ITEMS: { status: ResourceStatus; label: string }[] = [
  { status: 'Mentenanta', label: 'Resursă în mentenanță' },
  { status: 'Defecta', label: 'Resursă defectă' },
];

/**
 * Legenda calendarului: cum arată un interval liber, fiecare stare care ocupă resursa, timpul de
 * pregătire și o resursă indisponibilă. Pătratele folosesc aceleași stiluri ca evenimentele.
 */
export function AvailabilityLegend() {
  const theme = useTheme();
  const colors = eventColors(theme);
  const unavailableOpacity = theme.palette.action.disabledOpacity;

  const items: LegendItem[] = [
    { label: 'Liber', swatch: { bgcolor: 'background.paper', border: 1, borderColor: 'divider' } },
    ...OCCUPYING_STATUSES.map((status) => {
      const color = reservationStatusColors[status];
      return {
        label: reservationStatusLabels[status],
        swatch: PENDING_STATUSES.includes(status)
          ? { bgcolor: colors.tint(color), border: 2, borderStyle: 'dashed', borderColor: color }
          : { bgcolor: color },
      };
    }),
    {
      label: BUFFER_LABEL,
      swatch: { border: 1, borderStyle: 'dashed', borderColor: 'text.disabled' },
    },
    ...UNAVAILABLE_ITEMS.map(({ status, label }) => ({
      label,
      swatch: { bgcolor: alpha(resourceStatusColors[status], unavailableOpacity) },
    })),
  ];

  return (
    <Stack
      component="ul"
      aria-label="Legenda calendarului"
      direction="row"
      useFlexGap
      sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 1, listStyle: 'none', p: 0, m: 0 }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          component="li"
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Box
            aria-hidden
            sx={[
              {
                width: theme.spacing(2),
                height: theme.spacing(2),
                borderRadius: 0.5,
                boxSizing: 'border-box',
              },
              ...(Array.isArray(item.swatch) ? item.swatch : [item.swatch]),
            ]}
          />
          <Typography variant="body2">{item.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
