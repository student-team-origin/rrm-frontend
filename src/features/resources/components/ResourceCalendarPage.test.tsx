import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getLabs, getResource, getResourceAvailability, getResources } from '../api';
import type { Resource, ResourceListParams } from '../types';

vi.mock('../api');

const RESOURCES: Resource[] = [
  { id: 1, denumire: 'Braț robotic UR5', stare: 'Activa', timpPregatireMin: 15, laboratorId: 1 },
  {
    id: 6,
    denumire: 'Microscop Leica DM750',
    stare: 'Mentenanta',
    timpPregatireMin: 0,
    laboratorId: 2,
  },
];

const LABS = [
  { id: 1, denumire: 'Laborator Robotică' },
  { id: 2, denumire: 'Laborator Biologie' },
];

// În jsdom ecranul e considerat mic, deci calendarul pornește pe vizualizarea pe zi.
const TODAY = dayjs().startOf('day');
const TODAY_RANGE = {
  from: TODAY.toISOString(),
  to: TODAY.add(1, 'day').toISOString(),
};

function calendar() {
  return within(screen.getByRole('region', { name: 'Calendarul resursei' }));
}

describe('ResourceCalendarPage', () => {
  beforeEach(() => {
    // Ca backend-ul: filtrează după laborator și după textul căutat.
    vi.mocked(getResources).mockImplementation(async (params: ResourceListParams) => {
      const items = RESOURCES.filter(
        (resource) =>
          (!params.laboratorId || resource.laboratorId === params.laboratorId) &&
          (!params.q || resource.denumire?.toLowerCase().includes(params.q.toLowerCase())),
      );
      return { page: 0, size: 20, total: items.length, items };
    });
    vi.mocked(getResource).mockImplementation(async (id: number) => {
      const resource = RESOURCES.find((item) => item.id === id);
      if (!resource) {
        throw httpError(404, { code: 'RESURSA_INEXISTENTA', message: 'Resursa nu există.' });
      }
      return resource;
    });
    vi.mocked(getLabs).mockResolvedValue(LABS);
    vi.mocked(getResourceAvailability).mockResolvedValue([
      {
        start: TODAY.hour(10).toISOString(),
        sfarsit: TODAY.hour(12).minute(15).toISOString(),
        stare: 'Aprobata',
      },
    ]);
  });

  it('cere alegerea unei resurse, fără să încarce disponibilitatea', async () => {
    renderWithProviders(routes, '/calendar');

    expect(
      await screen.findByRole('heading', { name: 'Calendar disponibilitate', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Alege o resursă pentru a-i vedea calendarul.')).toBeInTheDocument();
    expect(getResourceAvailability).not.toHaveBeenCalled();
  });

  it('afișează intervalele ocupate ale resursei din URL, cu timpul de pregătire separat', async () => {
    renderWithProviders(routes, '/calendar?resursaId=1');

    await waitFor(() => expect(getResourceAvailability).toHaveBeenCalledWith(1, TODAY_RANGE));
    expect(await calendar().findByText('Aprobată')).toBeInTheDocument();
    expect(calendar().getByText('10:00 - 12:00')).toBeInTheDocument();
    expect(calendar().getByText('Pregătire')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Resursă' })).toHaveValue('Braț robotic UR5');
  });

  it('afișează legenda cu stările care ocupă resursa', async () => {
    renderWithProviders(routes, '/calendar');
    await screen.findByRole('heading', { name: 'Calendar disponibilitate', level: 1 });

    const legend = within(screen.getByRole('list', { name: 'Legenda calendarului' }));
    for (const label of [
      'Liber',
      'Așteaptă coordonatorul',
      'Așteaptă laboratorul',
      'Aprobată',
      'Activă',
      'Pregătire',
      'Resursă în mentenanță',
    ]) {
      expect(legend.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText('Respinsă')).not.toBeInTheDocument();
  });

  it('încarcă disponibilitatea resursei alese din listă', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/calendar');

    await user.click(await screen.findByRole('combobox', { name: 'Resursă' }));
    await user.click(
      await screen.findByRole('option', { name: 'Microscop Leica DM750 (Mentenanță)' }),
    );

    await waitFor(() => expect(getResourceAvailability).toHaveBeenCalledWith(6, TODAY_RANGE));
    expect(
      screen.getByText(
        'Resursa este în mentenanță și nu poate fi rezervată până nu redevine activă.',
      ),
    ).toBeInTheDocument();
  });

  it('filtrează resursele după laborator și renunță la resursa din alt laborator', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/calendar?resursaId=1');
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Resursă' })).toHaveValue('Braț robotic UR5'),
    );

    await user.click(screen.getByRole('combobox', { name: 'Laborator' }));
    await user.click(await screen.findByRole('option', { name: 'Laborator Biologie' }));

    expect(
      await screen.findByText('Alege o resursă pentru a-i vedea calendarul.'),
    ).toBeInTheDocument();
    expect(getResources).toHaveBeenLastCalledWith(expect.objectContaining({ laboratorId: 2 }));
    await user.click(screen.getByRole('combobox', { name: 'Resursă' }));
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        'Microscop Leica DM750 (Mentenanță)',
      ]),
    );
  });

  it('caută resursa pe server, ca toate resursele să poată fi găsite', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/calendar');

    await user.type(await screen.findByRole('combobox', { name: 'Resursă' }), 'micro');

    await waitFor(() =>
      expect(getResources).toHaveBeenLastCalledWith({ q: 'micro', page: 0, size: 20 }),
    );
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        'Microscop Leica DM750 (Mentenanță)',
      ]),
    );
  });

  it('spune câte resurse nu încap în listă', async () => {
    vi.mocked(getResources).mockResolvedValue({
      page: 0,
      size: 20,
      total: 45,
      items: RESOURCES,
    });
    renderWithProviders(routes, '/calendar');

    expect(
      await screen.findByText('Se afișează 2 din 45. Scrie pentru a căuta.'),
    ).toBeInTheDocument();
  });

  it('păstrează resursa din URL chiar dacă nu e printre primele din listă', async () => {
    vi.mocked(getResources).mockResolvedValue({
      page: 0,
      size: 20,
      total: 1,
      items: [RESOURCES[1]],
    });
    renderWithProviders(routes, '/calendar?resursaId=1');

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Resursă' })).toHaveValue('Braț robotic UR5'),
    );
    expect(getResource).toHaveBeenCalledWith(1);
  });

  it('cere luna întreagă la vizualizarea pe lună', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/calendar?resursaId=1');
    const region = within(await screen.findByRole('region', { name: 'Calendarul resursei' }));
    await region.findByText('Aprobată');

    await user.click(region.getByRole('button', { name: 'Lună' }));

    await waitFor(() =>
      expect(getResourceAvailability).toHaveBeenLastCalledWith(1, {
        from: expect.any(String),
        to: expect.any(String),
      }),
    );
    const [, range] = vi.mocked(getResourceAvailability).mock.lastCall ?? [];
    // Vizualizarea pe lună afișează 6 săptămâni complete.
    expect(dayjs(range?.to).diff(range?.from, 'day')).toBe(42);
  });

  it('afișează eroarea și permite reîncercarea', async () => {
    vi.mocked(getResourceAvailability).mockRejectedValueOnce(
      httpError(404, { code: 'RESURSA_INEXISTENTA', message: 'Resursa cu id-ul 1 nu există.' }),
    );
    const user = userEvent.setup();
    renderWithProviders(routes, '/calendar?resursaId=1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Resursa cu id-ul 1 nu există.');
    await user.click(screen.getByRole('button', { name: 'Reîncearcă' }));
    expect(await calendar().findByText('Aprobată')).toBeInTheDocument();
  });
});
