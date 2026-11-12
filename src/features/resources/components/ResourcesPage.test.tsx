import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getLabs, getResourceCategories, getResources } from '../api';
import type { Resource, ResourcePage } from '../types';

vi.mock('../api');

const RESOURCES: Resource[] = [
  {
    id: 15,
    denumire: 'Braț robotic UR5',
    stare: 'Activa',
    timpPregatireMin: 15,
    categorie: { id: 1, denumire: 'Robot educațional' },
    laboratorId: 2,
  },
  {
    id: 16,
    denumire: 'Imprimantă 3D Prusa',
    stare: 'Defecta',
    timpPregatireMin: 30,
    categorie: { id: 3, denumire: 'Fabricație' },
    laboratorId: 4,
  },
];

function page(items: Resource[], total = items.length): ResourcePage {
  return { page: 0, size: 20, total, items };
}

describe('ResourcesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getResources).mockResolvedValue(page(RESOURCES));
    vi.mocked(getLabs).mockResolvedValue([
      { id: 2, denumire: 'Laborator Robotică' },
      { id: 4, denumire: 'Laborator Fabricație digitală' },
    ]);
    vi.mocked(getResourceCategories).mockResolvedValue([
      { id: 1, denumire: 'Robot educațional' },
      { id: 3, denumire: 'Fabricație' },
    ]);
  });

  it('afișează în tabel resursele primite de la API', async () => {
    renderWithProviders(routes, '/resources');

    const row = (await screen.findByText('Braț robotic UR5')).closest('tr');
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement);
    expect(cells.getByText('Robot educațional')).toBeInTheDocument();
    expect(await cells.findByText('Laborator Robotică')).toBeInTheDocument();
    expect(cells.getByText('Activă')).toBeInTheDocument();
    expect(cells.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Imprimantă 3D Prusa')).toBeInTheDocument();
    expect(screen.getByText('Defectă')).toBeInTheDocument();
    expect(getResources).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('afișează un mesaj când nu există resurse', async () => {
    vi.mocked(getResources).mockResolvedValue(page([]));
    renderWithProviders(routes, '/resources');

    expect(await screen.findByText('Nu există resurse pentru filtrele alese')).toBeInTheDocument();
  });

  it('afișează eroarea de rețea și permite reîncercarea', async () => {
    vi.mocked(getResources).mockRejectedValueOnce(new Error('Network Error'));
    renderWithProviders(routes, '/resources');

    expect(await screen.findByRole('alert')).toHaveTextContent('Serverul nu răspunde');
    await userEvent.click(screen.getByRole('button', { name: 'Reîncearcă' }));
    expect(await screen.findByText('Braț robotic UR5')).toBeInTheDocument();
  });

  it('trimite căutarea și filtrul de stare către API, apoi le resetează', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/resources');
    await screen.findByText('Braț robotic UR5');

    await user.type(screen.getByRole('textbox', { name: 'Caută' }), 'robot');
    await waitFor(() =>
      expect(getResources).toHaveBeenLastCalledWith({ q: 'robot', page: 0, size: 20 }),
    );

    await user.click(screen.getByRole('combobox', { name: 'Stare' }));
    await user.click(await screen.findByRole('option', { name: 'Defectă' }));
    await waitFor(() =>
      expect(getResources).toHaveBeenLastCalledWith({
        q: 'robot',
        stare: 'Defecta',
        page: 0,
        size: 20,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Resetează' }));
    expect(screen.getByRole('textbox', { name: 'Caută' })).toHaveValue('');
    await waitFor(() => expect(getResources).toHaveBeenLastCalledWith({ page: 0, size: 20 }));
  });

  it('cere pagina următoare din TablePagination', async () => {
    vi.mocked(getResources).mockResolvedValue(page(RESOURCES, 45));
    renderWithProviders(routes, '/resources');
    await screen.findByText('1–20 din 45');

    await userEvent.click(screen.getByRole('button', { name: 'Pagina următoare' }));
    await waitFor(() => expect(getResources).toHaveBeenLastCalledWith({ page: 1, size: 20 }));
  });
});
