import { useRoutes, type RouteObject } from 'react-router-dom';

export type AppRoutesProps = { routes: RouteObject[] };

/** Randează rutele date (doar pentru teste, în `renderWithProviders`). */
export function AppRoutes({ routes }: AppRoutesProps) {
  return useRoutes(routes);
}
