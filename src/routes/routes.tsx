import { Navigate, type RouteObject } from 'react-router-dom';
import { ResourcesPage } from '../features/resources/components/ResourcesPage';
import { AppLayout } from '../shared/components/AppLayout';
import { NotFoundPage } from '../shared/components/NotFoundPage';

/**
 * Toate rutele aplicației. Paginile noi se adaugă ca rute copil ale layout-ului.
 * Rutele protejate pe roluri (ProtectedRoute) se adaugă odată cu TO-3.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/resources" replace /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
