import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getResource } from '../../resources/api';
import { cancelReservation, getMyReservations, getReservation } from '../api';
import type { Reservation, ReservationPage } from '../types';

vi.mock('../api');
vi.mock('../../resources/api');

const TOMORROW_10 = dayjs().add(1, 'day').hour(10).minute(0).second(0).millisecond(0);

const PENDING: Reservation = {
  id: 3,
  resursaId: 5,
  grantId: 1,
  solicitantId: 6,
  stare: 'InAsteptareLaborator',
  start: TOMORROW_10.toISOString(),
  sfarsit: TOMORROW_10.add(2, 'hour').toISOString(),
  oreSolicitate: 2,
  scop: 'Imprimarea carcasei pentru senzor',
};

const COMPLETED: Reservation = {
  id: 1,
  resursaId: 1,
  grantId: 1,
  solicitantId: 6,
  stare: 'Finalizata',
  start: TOMORROW_10.subtract(4, 'day').toISOString(),
  sfarsit: TOMORROW_10.subtract(4, 'day').add(2, 'hour').toISOString(),
  oreSolicitate: 2,
};

const RESOURCE_NAMES: Record<number, string> = {
  1: 'Braț robotic UR5',
  5: 'Imprimantă 3D Prusa MK4',
};

function page(items: Reservation[], total = items.length): ReservationPage {
  return { page: 0, size: 20, total, items };
}

function rowOf(text: string): HTMLElement {
  const row = screen.getByText(text).closest('tr');
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

describe('MyReservationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMyReservations).mockResolvedValue(page([PENDING, COMPLETED]));
    vi.mocked(getResource).mockImplementation((id) =>
      Promise.resolve({ id, denumire: RESOURCE_NAMES[id] }),
    );
  });

  it('afișează rezervările cu numele resursei, intervalul și starea', async () => {
    renderWithProviders(routes, '/reservations');

    expect(
      await screen.findByRole('heading', { name: 'Rezervările mele', level: 1 }),
    ).toBeInTheDocument();
    await screen.findByText('Imprimantă 3D Prusa MK4');
    const pendingRow = within(rowOf('Imprimantă 3D Prusa MK4'));
    expect(pendingRow.getByText('Așteaptă laboratorul')).toBeInTheDocument();
    expect(pendingRow.getByText(/10:00–12:00/)).toBeInTheDocument();
    expect(pendingRow.getByRole('button', { name: /^Anulează rezervarea/ })).toBeInTheDocument();

    const completedRow = within(rowOf('Braț robotic UR5'));
    expect(completedRow.getByText('Finalizată')).toBeInTheDocument();
    expect(
      completedRow.queryByRole('button', { name: /^Anulează rezervarea/ }),
    ).not.toBeInTheDocument();
    expect(getMyReservations).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('dă butoanelor din rânduri nume accesibile diferite (resursa și intervalul)', async () => {
    renderWithProviders(routes, '/reservations');
    await screen.findByText('Imprimantă 3D Prusa MK4');

    expect(
      screen.getByRole('button', {
        name: /^Anulează rezervarea Imprimantă 3D Prusa MK4, .*10:00–12:00$/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Detalii rezervare Braț robotic UR5, / }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Detalii rezervare/ })).toHaveLength(2);
  });

  it('filtrează după stare', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/reservations');
    await screen.findByText('Imprimantă 3D Prusa MK4');

    await user.click(screen.getByRole('combobox', { name: 'Stare' }));
    await user.click(await screen.findByRole('option', { name: 'Aprobată' }));

    await waitFor(() =>
      expect(getMyReservations).toHaveBeenLastCalledWith({ stare: 'Aprobata', page: 0, size: 20 }),
    );
  });

  it('afișează detaliul cu istoricul aprobărilor', async () => {
    vi.mocked(getReservation).mockResolvedValue({
      ...PENDING,
      resursa: { id: 5, denumire: 'Imprimantă 3D Prusa MK4' },
      aprobari: [
        {
          id: 10,
          rezervareId: 3,
          aprobatorId: 4,
          nivel: 1,
          decizie: 'Aprobat',
          observatie: 'Încadrat în bugetul de ore.',
          dataDecizie: TOMORROW_10.subtract(1, 'day').toISOString(),
        },
      ],
    });
    const user = userEvent.setup();
    renderWithProviders(routes, '/reservations');
    await screen.findByText('Imprimantă 3D Prusa MK4');

    await user.click(
      within(rowOf('Imprimantă 3D Prusa MK4')).getByRole('button', { name: /^Detalii rezervare/ }),
    );

    const dialog = await screen.findByRole('dialog', { name: 'Detaliile rezervării' });
    const history = within(
      await within(dialog).findByRole('list', { name: 'Istoricul aprobărilor' }),
    );
    expect(history.getByText(/Coordonator grant: Aprobat/)).toBeInTheDocument();
    expect(history.getByText('Încadrat în bugetul de ore.')).toBeInTheDocument();
    expect(history.getByText('Responsabil laborator: În așteptare')).toBeInTheDocument();
    expect(within(dialog).getByText('Imprimarea carcasei pentru senzor')).toBeInTheDocument();
    expect(getReservation).toHaveBeenCalledWith(3);
  });

  it('anulează rezervarea cu motiv, apoi reîncarcă lista', async () => {
    vi.mocked(cancelReservation).mockResolvedValue({ ...PENDING, stare: 'Anulata' });
    const user = userEvent.setup();
    renderWithProviders(routes, '/reservations');
    await screen.findByText('Imprimantă 3D Prusa MK4');

    await user.click(
      within(rowOf('Imprimantă 3D Prusa MK4')).getByRole('button', {
        name: /^Anulează rezervarea/,
      }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Anulează rezervarea' });
    expect(within(dialog).getByText(/Imprimantă 3D Prusa MK4/)).toBeInTheDocument();
    vi.mocked(getMyReservations).mockResolvedValue(
      page([{ ...PENDING, stare: 'Anulata' }, COMPLETED]),
    );
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Motiv (opțional)' }),
      'Nu mai am nevoie',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Anulează rezervarea' }));

    expect(
      await screen.findByText('Rezervarea a fost anulată. Intervalul a fost eliberat.'),
    ).toBeInTheDocument();
    expect(cancelReservation).toHaveBeenCalledWith(3, { motiv: 'Nu mai am nevoie' });
    expect(screen.queryByRole('dialog', { name: 'Anulează rezervarea' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(within(rowOf('Imprimantă 3D Prusa MK4')).getByText('Anulată')).toBeInTheDocument(),
    );
    expect(getMyReservations).toHaveBeenCalledTimes(2);
  });

  it('afișează motivul trimis de backend când anularea e refuzată', async () => {
    vi.mocked(cancelReservation).mockRejectedValue(
      httpError(409, {
        code: 'REZERVARE_INCEPUTA',
        message: 'Rezervarea a început deja și nu mai poate fi anulată.',
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(routes, '/reservations');
    await screen.findByText('Imprimantă 3D Prusa MK4');

    await user.click(
      within(rowOf('Imprimantă 3D Prusa MK4')).getByRole('button', {
        name: /^Anulează rezervarea/,
      }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Anulează rezervarea' });
    await user.click(within(dialog).getByRole('button', { name: 'Anulează rezervarea' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Rezervarea a început deja și nu mai poate fi anulată.',
    );
    expect(cancelReservation).toHaveBeenCalledWith(3, {});
  });

  it('afișează eroarea de rețea și permite reîncercarea', async () => {
    vi.mocked(getMyReservations).mockRejectedValueOnce(new Error('Network Error'));
    renderWithProviders(routes, '/reservations');

    expect(await screen.findByRole('alert')).toHaveTextContent('Serverul nu răspunde');
    await userEvent.click(screen.getByRole('button', { name: 'Reîncearcă' }));
    expect(await screen.findByText('Imprimantă 3D Prusa MK4')).toBeInTheDocument();
  });
});
