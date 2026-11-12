import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import {
  changeResourceStatus,
  createResource,
  deleteResource,
  getLabs,
  getResourceCategories,
  getResources,
  updateResource,
} from '../api';
import type { Resource } from '../types';

vi.mock('../api');

const UR5: Resource = {
  id: 15,
  denumire: 'Braț robotic UR5',
  specificatii: '6 axe',
  stare: 'Activa',
  timpPregatireMin: 15,
  reguliAcces: 'Necesită instruire SSM',
  categorie: { id: 1, denumire: 'Robot educațional' },
  laboratorId: 2,
};

async function openPage() {
  const user = userEvent.setup();
  renderWithProviders(routes, '/resources');
  await screen.findByText('Braț robotic UR5');
  return user;
}

async function choose(user: ReturnType<typeof userEvent.setup>, field: string, option: string) {
  const dialog = screen.getByRole('dialog');
  await user.click(within(dialog).getByRole('combobox', { name: field }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('ResourceFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getResources).mockResolvedValue({ page: 0, size: 20, total: 1, items: [UR5] });
    vi.mocked(getLabs).mockResolvedValue([
      { id: 2, denumire: 'Laborator Robotică' },
      { id: 4, denumire: 'Laborator Electronică' },
    ]);
    vi.mocked(getResourceCategories).mockResolvedValue([
      { id: 1, denumire: 'Robot educațional' },
      { id: 3, denumire: 'Instrument de măsură' },
    ]);
  });

  it('nu trimite formularul fără câmpurile obligatorii', async () => {
    const user = await openPage();
    await user.click(screen.getByRole('button', { name: 'Adaugă resursă' }));
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(await screen.findByText('Denumirea este obligatorie.')).toBeInTheDocument();
    expect(screen.getByText('Alege o categorie.')).toBeInTheDocument();
    expect(screen.getByText('Alege un laborator.')).toBeInTheDocument();
    expect(createResource).not.toHaveBeenCalled();
  });

  it('creează resursa cu datele introduse și reîncarcă lista', async () => {
    vi.mocked(createResource).mockResolvedValue({ ...UR5, id: 99 });
    const user = await openPage();
    await user.click(screen.getByRole('button', { name: 'Adaugă resursă' }));

    await user.type(screen.getByRole('textbox', { name: 'Denumire' }), '  Osciloscop Rigol  ');
    await choose(user, 'Categorie', 'Instrument de măsură');
    await choose(user, 'Laborator', 'Laborator Electronică');
    await user.type(screen.getByRole('textbox', { name: 'Specificații' }), '4 canale, 50 MHz');
    const buffer = screen.getByRole('spinbutton', { name: 'Timp pregătire (min)' });
    await user.clear(buffer);
    await user.type(buffer, '10');
    const listCallsBeforeSave = vi.mocked(getResources).mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    await waitFor(() =>
      expect(createResource).toHaveBeenCalledWith({
        denumire: 'Osciloscop Rigol',
        categorieId: 3,
        laboratorId: 4,
        specificatii: '4 canale, 50 MHz',
        timpPregatireMin: 10,
        reguliAcces: undefined,
      }),
    );
    expect(await screen.findByText('Resursa a fost salvată.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(vi.mocked(getResources).mock.calls.length).toBeGreaterThan(listCallsBeforeSave),
    );
  });

  it('dezactivează Salvează cât timp cererea este în curs', async () => {
    vi.mocked(createResource).mockReturnValue(new Promise(() => {}));
    const user = await openPage();
    await user.click(screen.getByRole('button', { name: 'Adaugă resursă' }));
    await user.type(screen.getByRole('textbox', { name: 'Denumire' }), 'Robot NAO');
    await choose(user, 'Categorie', 'Robot educațional');
    await choose(user, 'Laborator', 'Laborator Robotică');

    await user.click(screen.getByRole('button', { name: 'Salvează' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvează' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Renunță' })).toBeDisabled();
    expect(createResource).toHaveBeenCalledTimes(1);
  });

  it('afișează erorile 400 pe câmpurile formularului', async () => {
    vi.mocked(updateResource).mockRejectedValue(
      httpError(400, {
        code: 'VALIDARE',
        message: 'Date invalide',
        fields: { denumire: 'Există deja o resursă cu această denumire.' },
      }),
    );
    const user = await openPage();
    await user.click(screen.getByRole('button', { name: 'Editează Braț robotic UR5' }));

    expect(screen.getByRole('textbox', { name: 'Denumire' })).toHaveValue('Braț robotic UR5');
    expect(screen.getByRole('textbox', { name: 'Reguli de acces' })).toHaveValue(
      'Necesită instruire SSM',
    );
    await user.click(screen.getByRole('button', { name: 'Salvează' }));

    expect(
      await screen.findByText('Există deja o resursă cu această denumire.'),
    ).toBeInTheDocument();
    expect(updateResource).toHaveBeenCalledWith(15, expect.objectContaining({ categorieId: 1 }));
  });

  it('explică de ce o resursă cu rezervări nu poate fi ștearsă (409)', async () => {
    vi.mocked(deleteResource).mockRejectedValue(
      httpError(409, { code: 'RESURSA_ARE_REZERVARI', message: 'Conflict' }),
    );
    const user = await openPage();
    await user.click(screen.getByRole('button', { name: 'Șterge Braț robotic UR5' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Sigur ștergi resursa „Braț robotic UR5”?');
    await user.click(within(dialog).getByRole('button', { name: 'Șterge' }));

    expect(
      await within(dialog).findByText('Resursa are rezervări și nu poate fi ștearsă.'),
    ).toBeInTheDocument();
    expect(deleteResource).toHaveBeenCalledWith(15);
  });

  it('schimbă starea resursei din meniul rândului', async () => {
    vi.mocked(changeResourceStatus).mockResolvedValue({ resursa: UR5, rezervariAnulate: 2 });
    const user = await openPage();
    await user.click(
      screen.getByRole('button', { name: 'Schimbă starea pentru Braț robotic UR5' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Mentenanță' }));

    expect(changeResourceStatus).toHaveBeenCalledWith(15, { stare: 'Mentenanta' });
    expect(await screen.findByText(/este acum Mentenanță/)).toHaveTextContent(
      '2 rezervări au fost anulate',
    );
  });
});
