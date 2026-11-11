import { createTheme } from '@mui/material/styles';
import type { components } from './api/schema';

type ResourceStatus = components['schemas']['StareResursa'];
type ReservationStatus = components['schemas']['StareRezervare'];

/** Culorile stărilor, refolosite în tabele, chip-uri, calendar și grafice. */
export const resourceStatusColors: Record<ResourceStatus, string> = {
  Activa: '#2e7d32',
  Mentenanta: '#ed6c02',
  Defecta: '#d32f2f',
};

export const resourceStatusLabels: Record<ResourceStatus, string> = {
  Activa: 'Activă',
  Mentenanta: 'Mentenanță',
  Defecta: 'Defectă',
};

export const reservationStatusColors: Record<ReservationStatus, string> = {
  InAsteptareCoordonator: '#ed6c02',
  InAsteptareLaborator: '#f9a825',
  Aprobata: '#1565c0',
  Activa: '#2e7d32',
  Finalizata: '#616161',
  Respinsa: '#d32f2f',
  Anulata: '#9e9e9e',
  AnulataAutomat: '#9e9e9e',
};

export const theme = createTheme({
  palette: {
    primary: { main: '#0b5cad' },
    secondary: { main: '#00897b' },
    background: { default: '#f5f7fa' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
