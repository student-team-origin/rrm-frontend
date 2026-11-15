import { Navigate, type RouteObject } from 'react-router-dom';
import { LoginPage } from '../features/auth/components/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { MyReservationsPage } from '../features/reservations/components/MyReservationsPage';
import { ResourcesPage } from '../features/resources/components/ResourcesPage';
import { AppLayout } from '../shared/components/AppLayout';
import { NotFoundPage } from '../shared/components/NotFoundPage';

/**
 * Toate rutele aplicației. `/login` este publică; restul trec prin `ProtectedRoute`. Paginile noi
 * se adaugă ca rute copil ale layout-ului; o pagină doar pentru anumite roluri se înfășoară în
 * `{ element: <ProtectedRoute roles={[...]} />, children: [...] }`.
 */
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/resources" replace /> },
          { path: 'resources', element: <ResourcesPage /> },
          { path: 'reservations', element: <MyReservationsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];