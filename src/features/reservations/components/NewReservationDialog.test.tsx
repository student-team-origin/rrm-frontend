import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getLabs, getResource, getResourceAvailability } from '../../resources/api';
import { createReservation, getGrants, getMyReservations } from '../api';
import type { Grant, Reservation } from '../types';

vi.mock('../../resources/api');
vi.mock('../api');

const GRANTS: Grant[] = [
  { id: 3, cod: 'PN-III-P4-2026', oreAlocate: 120, oreConsumate: 78, oreRamase: 42 },
  { id: 4, cod: 'PED-2026-11', oreAlocate: 20, oreConsumate: 19, oreRamase: 1 },
  { id: 5, cod: 'TE-2024-01', oreAlocate: 50, oreRamase: 10, dataSfarsit: '2025-06-30' },
];

const TOMORROW = dayjs().add(1, 'day').startOf('day');
const START = TOMORROW.hour(10);
const END = TOMORROW.hour(12);

const CREATED: Reservation = {
  id: 101,
  resursaId: 15,
  grantId: 3,
  stare: 'InAsteptareCoordonator',
  start: START.format(),
  sfarsit: END.format(),
  oreSolicitate: 2,
  scop: 'Testare traiectorii',
};

async function openDialog() {
  const user = userEvent.setup();
  renderWithProviders(routes, '/resources/15');
  await user.click(await screen.findByRole('button', { name: 'Rezervă' }));
  const dialog = await screen.findByRole('dialog', { name: /Rezervare nouă/ });
  return { user, dialog: within(dialog) };
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  dialog: ReturnType<typeof within>,
  grant = 'PN-III-P4-2026',
) {
  fireEvent.change(dialog.getByLabelText(/Început/), {
    target: { value: START.format('YYYY-MM-DDTHH:mm') },
  });
  fireEvent.change(dialog.getByLabelText(/Sfârșit/), {
    target: { value: END.format('YYYY-MM-DDTHH:mm') },
  });
  await user.click(dialog.getByRole('combobox', { name: /Grant/ }));
  await user.click(await screen.findByRole('option', { name: new RegExp(grant) }));
  await user.type(dialog.getByLabelText(/Scopul rezervării/), 'Testare traiectorii');
}

describe('NewReservationDialog', () => {
  beforeEach(() => {
    vi.mocked(getResource).mockResolvedValue({
      id: 15,
      denumire: 'Braț robotic UR5',
      stare: 'Activa',
    });
    vi.mocked(getLabs).mockResolvedValue([]);
    vi.mocked(getResourceAvailability).mockResolvedValue([]);
    vi.mocked(getGrants).mockResolvedValue(GRANTS);
  });

  it('afișează granturile cu orele rămase și validează câmpurile obligatorii', async () => {
    const { user, dialog } = await openDialog();

    await user.click(dialog.getByRole('combobox', { name: /Grant/ }));
    expect(
      await screen.findByRole('option', { name: 'PN-III-P4-2026 · 42 h rămase' }),
    ).toBeVisible();
    await user.keyboard('{Escape}');
    await user.click(dialog.getByRole('button', { name: 'Trimite cererea' }));

    expect(await dialog.findByText('Alege începutul intervalului.')).toBeInTheDocument();
    expect(dialog.getByText('Alege grantul pe care se rezervă.')).toBeInTheDocument();
    expect(dialog.getByText('Scopul este obligatoriu.')).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it('trimite cererea și o arată în „Rezervările mele” cu starea în așteptare', async () => {
    vi.mocked(createReservation).mockResolvedValue(CREATED);
    vi.mocked(getMyReservations).mockResolvedValue({
      page: 0,
      size: 20,
      total: 1,
      items: [CREATED],
    });
    const { user, dialog } = await openDialog();

    await fillForm(user, dialog);
    expect(dialog.getByText('Durata: 2 h')).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Trimite cererea' }));

    expect(createReservation).toHaveBeenCalledWith({
      resursaId: 15,
      grantId: 3,
      start: START.format(),
      sfarsit: END.format(),
      scop: 'Testare traiectorii',
    });
    expect(await screen.findByText('Cererea a fost trimisă și așteaptă aprobarea.')).toBeVisible();
    expect(screen.queryByRole('dialog', { name: /Rezervare nouă/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Rezervările mele' }));
    expect(await screen.findAllByText('Așteaptă coordonatorul')).not.toHaveLength(0);
  });

  it('la 409 arată intervalele libere și mută intervalul pe cel ales', async () => {
    vi.mocked(createReservation).mockRejectedValueOnce(
      httpError(409, {
        code: 'INTERVAL_OCUPAT',
        message: 'Intervalul selectat se suprapune cu o altă rezervare.',
        intervaleLibere: [
          { start: TOMORROW.hour(8).format(), sfarsit: TOMORROW.hour(9).format() },
          { start: TOMORROW.hour(14).format(), sfarsit: TOMORROW.hour(18).format() },
        ],
      } as Parameters<typeof httpError>[1]),
    );
    const { user, dialog } = await openDialog();
    await fillForm(user, dialog);
    await user.click(dialog.getByRole('button', { name: 'Trimite cererea' }));

    expect(await dialog.findByText('Interval ocupat')).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: '14:00–18:00' }));

    expect(dialog.queryByText('Interval ocupat')).not.toBeInTheDocument();
    expect(dialog.getByLabelText(/Început/)).toHaveValue(
      TOMORROW.hour(14).format('YYYY-MM-DDTHH:mm'),
    );
    // Durata cerută (2 h) se păstrează.
    expect(dialog.getByLabelText(/Sfârșit/)).toHaveValue(
      TOMORROW.hour(16).format('YYYY-MM-DDTHH:mm'),
    );
  });

  it('la 422 arată motivul (sold insuficient pe grant)', async () => {
    const message = 'Grantul mai are 1 ore disponibile, iar rezervarea necesită 2 ore.';
    vi.mocked(createReservation).mockRejectedValueOnce(
      httpError(422, { code: 'SOLD_INSUFICIENT', message }),
    );
    const { user, dialog } = await openDialog();
    await fillForm(user, dialog, 'PED-2026-11');
    expect(
      dialog.getByText('Rezervarea necesită 2 h, dar grantul mai are doar 1 h.'),
    ).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Trimite cererea' }));

    expect(await dialog.findByText(message)).toBeInTheDocument();
    expect(dialog.getByText('Cererea nu poate fi trimisă')).toBeInTheDocument();
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Trimite cererea' })).toBeEnabled(),
    );
  });

  it('explică de ce nu se poate rezerva fără granturi', async () => {
    vi.mocked(getGrants).mockResolvedValue([]);
    const { dialog } = await openDialog();

    expect(await dialog.findByText(/Nu faci parte din niciun grant/)).toBeInTheDocument();
    expect(dialog.queryByRole('button', { name: 'Trimite cererea' })).not.toBeInTheDocument();
  });
});
