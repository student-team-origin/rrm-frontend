import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { setUnauthorizedHandler } from './api/client';
import { queryClient } from './api/queryClient';
import { routes } from './routes/routes';
import { theme } from './theme';

const router = createBrowserRouter(routes);

// Sesiune expirată sau token invalid (401): datele utilizatorului se șterg din cache, iar după
// autentificare se revine pe pagina curentă.
setUnauthorizedHandler(() => {
  queryClient.clear();
  const { location } = router.state;
  if (location.pathname !== '/login') {
    void router.navigate('/login', { replace: true, state: { from: location } });
  }
});

/** Rădăcina aplicației: providerii comuni (date, temă) și rutarea. */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
