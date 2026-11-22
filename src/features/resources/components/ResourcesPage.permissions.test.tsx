import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routes } from '../../../routes/routes';
import {
  ADMIN_USER,
  GRANT_COORDINATOR_USER,
  LAB_2_MANAGER_USER,
  TEST_USER,
} from '../../../test/authenticatedUser';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getCurrentUser } from '../../auth/api';
import type { CurrentUser } from '../../auth/types';
import { getLabs, getResourceCategories, getResources } from '../api';
import type { Resource } from '../types';

vi.mock('../api');

const UR5: Resource = {
  id: 15,
  denumire: 'Braț robotic UR5',
  stare: 'Activa',
  categorie: { id: 1, denumire: 'Robot educațional' },
  laboratorId: 2,
};
const PRUSA: Resource = {
  id: 16,
  denumire: 'Imprimantă 3D Prusa',
  stare: 'Activa',
  categorie: { id: 3, denumire: 'Fabricație' },
  laboratorId: 4,
};

async function openCatalogAs(user: CurrentUser) {
  vi.mocked(getCurrentUser).mockResolvedValue(user);
  renderWithProviders(routes, '/resources');
  // Laboratoarele încărcate: numele apare în tabel.
  await screen.findByText('Laborator Fabricație digitală');
}

function actionsOf(name: string) {
  const row = screen.getByText(name).closest('tr') as HTMLElement;
  return within(row).queryAllByRole('button');
}

describe('ResourcesPage – acțiunile după rolul utilizatorului (TO-75)', () => {
  beforeEach(() => {
    vi.mocked(getResources).mockResolvedValue({ page: 0, size: 20, total: 2, items: [UR5, PRUSA] });
    vi.mocked(getLabs).mockResolvedValue([
      { id: 2, denumire: 'Laborator Robotică' },
      { id: 4, denumire: 'Laborator Fabricație digitală' },
    ]);
    vi.mocked(getResourceCategories).mockResolvedValue([
      { id: 1, denumire: 'Robot educațional' },
      { id: 3, denumire: 'Fabricație' },
    ]);
  });

  it.each([
    ['Studentul', TEST_USER],
    ['Coordonatorul de grant', GRANT_COORDINATOR_USER],
  ])('%s vede catalogul cu filtre, fără „Adaugă resursă” și fără acțiuni', async (_, user) => {
    await openCatalogAs(user);

    expect(screen.getByLabelText('Caută')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adaugă resursă' })).not.toBeInTheDocument();
    expect(actionsOf('Braț robotic UR5')).toHaveLength(0);
    expect(actionsOf('Imprimantă 3D Prusa')).toHaveLength(0);
  });

  it('Responsabilul Laboratorului 2 are acțiuni doar pe resursele lui și adaugă doar acolo', async () => {
    const user = userEvent.setup();
    await openCatalogAs(LAB_2_MANAGER_USER);

    expect(screen.getByRole('button', { name: 'Editează Braț robotic UR5' })).toBeInTheDocument();
    expect(actionsOf('Imprimantă 3D Prusa')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Adaugă resursă' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Laborator' }),
    );
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Laborator Robotică']);
  });

  it('Administratorul vede toate acțiunile și toate laboratoarele în formular', async () => {
    const user = userEvent.setup();
    await openCatalogAs(ADMIN_USER);

    expect(screen.getByRole('button', { name: 'Editează Braț robotic UR5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Șterge Imprimantă 3D Prusa' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Schimbă starea pentru Imprimantă 3D Prusa' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Adaugă resursă' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('combobox', { name: 'Laborator' }),
    );
    expect(await screen.findAllByRole('option')).toHaveLength(2);
  });
});
