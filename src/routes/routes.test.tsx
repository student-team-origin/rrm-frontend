import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/renderWithProviders';
import { routes } from './routes';

describe('routes', () => {
  // Notă: redirecționarea „/” → „/resources” (<Navigate>) nu se testează în jsdom: React Router
  // creează un Request din Node care nu acceptă AbortSignal-ul din jsdom. În browser funcționează.
  it('afișează Catalog resurse în layout-ul cu meniu', async () => {
    renderWithProviders(routes, '/resources');

    expect(
      await screen.findByRole('heading', { name: 'Catalog resurse', level: 1 }),
    ).toBeInTheDocument();

    // În jsdom ecranul e considerat mic, deci meniul lateral se deschide din buton.
    await userEvent.click(screen.getByRole('button', { name: 'Deschide meniul' }));
    expect(await screen.findByRole('link', { name: 'Catalog resurse' })).toBeInTheDocument();
  });

  it('afișează pagina de eroare pentru o adresă inexistentă', async () => {
    renderWithProviders(routes, '/nu-exista');

    expect(await screen.findByRole('heading', { name: 'Pagina nu există' })).toBeInTheDocument();
  });
});
