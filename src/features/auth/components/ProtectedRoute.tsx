import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, toApiError } from '../../../api/client';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { Role } from '../types';

export type ProtectedRouteProps = {
  /** Dacă e dat, pagina e accesibilă doar utilizatorilor cu cel puțin unul dintre aceste roluri. */
  roles?: Role[];
};

/**
 * Lasă să treacă doar utilizatorii autentificați; ceilalți ajung la /login, iar după autentificare
 * revin pe pagina cerută. Cu `roles`, verifică și rolul (RBAC, TO-3); backend-ul rămâne cel care
 * impune drepturile, aici doar nu se afișează pagini inutile.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const userQuery = useCurrentUser();

  if (getToken() === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (userQuery.isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress aria-label="Se verifică sesiunea" />
      </Box>
    );
  }
  if (userQuery.isError) {
    // Un 401 a dus deja la /login (interceptorul din api/client.ts); aici rămân erorile de rețea.
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => userQuery.refetch()}>
              Reîncearcă
            </Button>
          }
        >
          {toApiError(userQuery.error).message}
        </Alert>
      </Box>
    );
  }
  const userRoles = userQuery.data.roluri?.map((role) => role.rol) ?? [];
  if (roles && !roles.some((role) => userRoles.includes(role))) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Nu ai acces la această pagină.</Alert>
      </Box>
    );
  }
  return <Outlet />;
}
