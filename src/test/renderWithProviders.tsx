import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, type RouteObject } from 'react-router-dom';
import { theme } from '../theme';
import { AppRoutes } from './AppRoutes';

/**
 * Randează rutele date cu toți providerii aplicației, pornind de la adresa `initialPath`.
 * Fiecare test primește un QueryClient nou, fără reîncercări.
 *
 * Folosește `MemoryRouter` + `useRoutes`, nu `createMemoryRouter`: la o navigare (`<Navigate>`,
 * `navigate()`), router-ul de date construiește un `Request` din Node care nu acceptă
 * `AbortSignal`-ul din jsdom. Aplicația nu folosește loadere sau acțiuni, deci rutele se comportă
 * la fel ca în `createBrowserRouter`.
 */
export function renderWithProviders(routes: RouteObject[], initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MemoryRouter initialEntries={[initialPath]}>
          <AppRoutes routes={routes} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
