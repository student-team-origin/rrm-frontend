import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { queryClient } from './api/queryClient';
import { routes } from './routes/routes';
import { theme } from './theme';

const router = createBrowserRouter(routes);

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
