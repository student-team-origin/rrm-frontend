import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getResourceAvailability, getResources } from '../api';
import type { Resource } from '../types';

vi.mock('../api');

const RESOURCES: Resource[] = [
  { id: 1, denumire: 'Braț robotic UR5', stare: 'Activa', timpPregatireMin: 15 },
  { id: 6, denumire: 'Microscop Leica DM750', stare: 'Mentenanta', timpPregatireMin: 0 },
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
    vi.mocked(getResources).mockResolvedValue({
      page: 0,
      size: 100,
      total: RESOURCES.length,
      items: RESOURCES,
    });
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
      await screen.findByRole('heading', { name: 'Calendar resurse', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Alege o resursă pentru a-i vedea calendarul.')).toBeInTheDocument();
    expect(getResourceAvailability).not.toHaveBeenCalled();
  });

  it('afișează intervalele ocupate ale resursei din URL, pentru ziua afișată', async () => {
    renderWithProviders(routes, '/calendar?resursaId=1');

    await waitFor(() => expect(getResourceAvailability).toHaveBeenCalledWith(1, TODAY_RANGE));
    expect(await calendar().findByText('Aprobată')).toBeInTheDocument();
    expect(calendar().getByText('10:00 - 12:15')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Resursă' })).toHaveTextContent('Braț robotic UR5');
  });

  it('afișează legenda cu stările care ocupă resursa', async () => {
    renderWithProviders(routes, '/calendar');
    await screen.findByRole('heading', { name: 'Calendar resurse', level: 1 });

    for (const label of ['Așteaptă coordonatorul', 'Așteaptă laboratorul', 'Aprobată', 'Activă']) {
      expect(screen.getByText(label)).toBeInTheDocument();
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
