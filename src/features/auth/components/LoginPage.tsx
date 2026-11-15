import { zodResolver } from '@hookform/resolvers/zod';
import LoginIcon from '@mui/icons-material/Login';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { getHttpStatus, getToken, toApiError } from '../../../api/client';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormValues } from '../schemas';

/** Pagina la care se ajunge după login, dacă utilizatorul nu venea de pe o pagină protejată. */
export const DEFAULT_PAGE = '/resources';

/** Mesajul pentru e-mail inexistent sau parolă greșită (backend: 401 `CREDENTIALE_INVALIDE`). */
export const INVALID_CREDENTIALS_MESSAGE = 'E-mail sau parolă incorecte.';

/** Mesajul afișat cât timp verificarea 2FA nu este implementată (TO-32). */
export const TWO_FACTOR_PENDING_MESSAGE =
  'Contul tău are autentificarea în doi pași activă. Verificarea codului va fi disponibilă în ' +
  'curând; până atunci, folosește un cont fără 2FA.';

type LoginLocationState = { from?: Location } | null;

/**
 * Pagina de autentificare cu e-mail și parolă. După login, utilizatorul revine pe pagina protejată
 * de pe care a fost trimis aici (sau pe Catalog resurse).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [submitError, setSubmitError] = useState<string>();
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', parola: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const from = (location.state as LoginLocationState)?.from;
  const target = from ? `${from.pathname}${from.search}` : DEFAULT_PAGE;

  const handleLogin = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    setTwoFactorRequired(false);
    try {
      const response = await loginMutation.mutateAsync(values);
      if (response.twoFactorRequired) {
        // TODO: TO-32 - pagina de verificare a codului 2FA, cu response.challengeId.
        setTwoFactorRequired(true);
        return;
      }
      navigate(target, { replace: true });
    } catch (error) {
      setSubmitError(loginErrorMessage(error));
    }
  });

  if (getToken() !== null && !loginMutation.isPending) {
    return <Navigate to={target} replace />;
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Autentificare
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Research Resource Manager
          </Typography>

          <Stack component="form" noValidate onSubmit={handleLogin} spacing={2}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            {twoFactorRequired && <Alert severity="info">{TWO_FACTOR_PENDING_MESSAGE}</Alert>}
            <TextField
              {...form.register('email')}
              label="E-mail instituțional"
              type="email"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              error={errors.email !== undefined}
              helperText={errors.email?.message}
            />
            <TextField
              {...form.register('parola')}
              label="Parolă"
              type="password"
              autoComplete="current-password"
              required
              fullWidth
              error={errors.parola !== undefined}
              helperText={errors.parola?.message}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size="1em" color="inherit" /> : <LoginIcon />
              }
            >
              Intră în cont
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

/** 401 `CREDENTIALE_INVALIDE` → mesajul fix; restul (ex. cont dezactivat) → mesajul backend-ului. */
function loginErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (getHttpStatus(error) === 401 && apiError.code === 'CREDENTIALE_INVALIDE') {
    return INVALID_CREDENTIALS_MESSAGE;
  }
  return apiError.message;
}
