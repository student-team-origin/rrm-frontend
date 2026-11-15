import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RouteObject } from 'react-router-dom';
import { TOKEN_STORAGE_KEY } from '../../../api/client';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { logout } from '../api';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../../resources/api', () => ({
  getResources: () => Promise.resolve({ page: 0, size: 20, total: 0, items: [] }),
  getLabs: () => Promise.resolve([]),
  getResourceCategories: () => Promise.resolve([]),
}));

describe('ProtectedRoute', () => {
  it('trimite la /login un utilizator neautentificat', async () => {
    sessionStorage.clear();
    renderWithProviders(routes, '/resources');

    expect(await screen.findByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Catalog resurse' })).not.toBeInTheDocument();
  });

  it('afișează pagina și numele utilizatorului autentificat', async () => {
    renderWithProviders(routes, '/resources');

    expect(
      await screen.findByRole('heading', { name: 'Catalog resurse', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Andrei Popescu')).toBeInTheDocument();
  });

  it('cu roles, blochează utilizatorii fără rolul cerut', async () => {
    const adminOnly: RouteObject[] = [
      {
        element: <ProtectedRoute roles={['AdministratorSistem']} />,
        children: [{ path: '/admin', element: <h1>Administrare</h1> }],
      },
    ];
    renderWithProviders(adminOnly, '/admin');

    expect(await screen.findByText('Nu ai acces la această pagină.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Administrare' })).not.toBeInTheDocument();
  });
});

describe('Deconectare', () => {
  it('închide sesiunea, șterge tokenul și revine la /login', async () => {
    vi.mocked(logout).mockResolvedValue();
    renderWithProviders(routes, '/resources');

    await userEvent.click(await screen.findByRole('button', { name: 'Deconectare' }));

    expect(await screen.findByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
    expect(logout).toHaveBeenCalled();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('se deconectează local chiar dacă serverul nu răspunde', async () => {
    vi.mocked(logout).mockRejectedValue(new Error('rețea'));
    renderWithProviders(routes, '/resources');

    await userEvent.click(await screen.findByRole('button', { name: 'Deconectare' }));

    expect(await screen.findByRole('heading', { name: 'Autentificare' })).toBeInTheDocument();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
