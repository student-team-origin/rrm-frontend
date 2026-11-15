import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TOKEN_STORAGE_KEY, apiClient, clearSessionExpired } from '../../../api/client';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getCurrentUser, login } from '../api';
import {
  INVALID_CREDENTIALS_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  TWO_FACTOR_PENDING_MESSAGE,
} from './LoginPage';

// Catalogul (pagina de după login) cere date de la API; aici contează doar autentificarea.
vi.mock('../../resources/api', () => ({
  getResources: () => Promise.resolve({ page: 0, size: 20, total: 0, items: [] }),
  getLabs: () => Promise.resolve([]),
  getResourceCategories: () => Promise.resolve([]),
}));

async function fillAndSubmit(email: string, parola: string) {
  await userEvent.type(screen.getByLabelText(/E-mail instituțional/), email);
  await userEvent.type(screen.getByLabelText(/Parolă/), parola);
  await userEvent.click(screen.getByRole('button', { name: 'Intră în cont' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearSessionExpired();
  });

  it('nu trimite formularul fără e-mail și parolă', async () => {
    renderWithProviders(routes, '/login');

    await userEvent.click(screen.getByRole('button', { name: 'Intră în cont' }));

    expect(await screen.findByText('E-mailul este obligatoriu.')).toBeInTheDocument();
    expect(screen.getByText('Parola este obligatorie.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('la succes păstrează tokenul, încarcă utilizatorul și deschide Catalogul', async () => {
    vi.mocked(login).mockResolvedValue({
      twoFactorRequired: false,
      tokens: { accessToken: 'jwt-nou', expiresIn: 28800 },
    });
    renderWithProviders(routes, '/login');

    await fillAndSubmit('andrei.popescu@student.usv.ro', 'parola123');

    expect(
      await screen.findByRole('heading', { name: 'Catalog resurse', level: 1 }),
    ).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({
      email: 'andrei.popescu@student.usv.ro',
      parola: 'parola123',
    });
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('jwt-nou');
    expect(getCurrentUser).toHaveBeenCalled();
    expect(screen.getByText('Andrei Popescu')).toBeInTheDocument();
  });

  it('la 401 afișează „E-mail sau parolă incorecte” și nu păstrează niciun token', async () => {
    vi.mocked(login).mockRejectedValue(
      httpError(401, { code: 'CREDENTIALE_INVALIDE', message: 'E-mail sau parolă incorecte.' }),
    );
    renderWithProviders(routes, '/login');

    await fillAndSubmit('andrei.popescu@student.usv.ro', 'gresita');

    expect(await screen.findByText(INVALID_CREDENTIALS_MESSAGE)).toBeInTheDocument();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
  });

  it('pentru un cont dezactivat afișează mesajul de la server', async () => {
    vi.mocked(login).mockRejectedValue(
      httpError(401, { code: 'CONT_DEZACTIVAT', message: 'Contul este dezactivat.' }),
    );
    renderWithProviders(routes, '/login');

    await fillAndSubmit('andrei.popescu@student.usv.ro', 'parola123');

    expect(await screen.findByText('Contul este dezactivat.')).toBeInTheDocument();
  });

  it('dacă se cere 2FA, afișează un mesaj și rămâne pe pagină fără token', async () => {
    vi.mocked(login).mockResolvedValue({ twoFactorRequired: true, challengeId: 'ch_1' });
    renderWithProviders(routes, '/login');

    await fillAndSubmit('admin@usv.ro', 'parola123');

    expect(await screen.findByText(TWO_FACTOR_PENDING_MESSAGE)).toBeInTheDocument();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });
  it('după o sesiune expirată (401 la o cerere) explică de ce a ajuns la login', async () => {
    const expired = httpError(401, { code: 'SESIUNE_EXPIRATA', message: 'Sesiunea a expirat.' });
    await expect(
      apiClient.get('/resources', {
        adapter: (config) => {
          expired.config = config;
          return Promise.reject(expired);
        },
      }),
    ).rejects.toThrow();

    renderWithProviders(routes, '/login');

    expect(await screen.findByText(SESSION_EXPIRED_MESSAGE)).toBeInTheDocument();
  });

  it('fără mesaj de sesiune expirată la o vizită obișnuită a paginii', async () => {
    renderWithProviders(routes, '/login');

    expect(await screen.findByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
    expect(screen.queryByText(SESSION_EXPIRED_MESSAGE)).not.toBeInTheDocument();
  });

  it('dacă /auth/me eșuează după login, rămâne pe login cu eroarea și fără token', async () => {
    vi.mocked(login).mockResolvedValue({
      twoFactorRequired: false,
      tokens: { accessToken: 'jwt-nou', expiresIn: 28800 },
    });
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('rețea'));
    renderWithProviders(routes, '/login');

    await fillAndSubmit('andrei.popescu@student.usv.ro', 'parola123');

    expect(
      await screen.findByText('Serverul nu răspunde. Verifică conexiunea și încearcă din nou.'),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
  });
});
