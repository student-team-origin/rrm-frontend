import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getLabs, getResource, getResourceAvailability } from '../api';
import type { Resource } from '../types';

vi.mock('../api');

const RESOURCE: Resource = {
  id: 15,
  denumire: 'Braț robotic UR5',
  specificatii: '6 axe, sarcină utilă 5 kg, rază 850 mm',
  stare: 'Activa',
  timpPregatireMin: 15,
  reguliAcces: 'Necesită instruire SSM',
  categorie: { id: 1, denumire: 'Robot educațional' },
  laboratorId: 2,
};

// În jsdom ecranul e considerat mic, deci calendarul pornește pe vizualizarea pe zi.
const TODAY = dayjs().startOf('day');
const TODAY_RANGE = { from: TODAY.toISOString(), to: TODAY.add(1, 'day').toISOString() };

function calendar() {
  return within(screen.getByRole('region', { name: 'Calendarul resursei' }));
}

describe('ResourceDetailPage', () => {
  beforeEach(() => {
    vi.mocked(getResource).mockResolvedValue(RESOURCE);
    vi.mocked(getLabs).mockResolvedValue([
      { id: 2, denumire: 'Laborator Robotică', locatie: 'Corp C, C204' },
    ]);
    vi.mocked(getResourceAvailability).mockResolvedValue([
      {
        start: TODAY.hour(10).toISOString(),
        sfarsit: TODAY.hour(12).minute(15).toISOString(),
        stare: 'InAsteptareCoordonator',
      },
    ]);
  });

  it('afișează datele resursei și butonul „Rezervă” pentru o resursă activă', async () => {
    renderWithProviders(routes, '/resources/15');

    const title = await screen.findByRole('heading', { name: 'Braț robotic UR5', level: 1 });
    // Starea resursei e chip-ul de lângă titlu („Activă” apare și în legenda calendarului).
    expect(within(title.parentElement as HTMLElement).getByText('Activă')).toBeInTheDocument();
    expect(getResource).toHaveBeenCalledWith(15);
    const details = within(screen.getByRole('region', { name: 'Datele resursei' }));
    expect(details.getByText('Robot educațional')).toBeInTheDocument();
    expect(await details.findByText('Laborator Robotică')).toBeInTheDocument();
    expect(details.getByText('Corp C, C204')).toBeInTheDocument();
    expect(details.getByText('15 min după fiecare rezervare')).toBeInTheDocument();
    expect(details.getByText('6 axe, sarcină utilă 5 kg, rază 850 mm')).toBeInTheDocument();
    expect(details.getByText('Necesită instruire SSM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rezervă' })).toBeInTheDocument();
  });

  it('afișează în calendar intervalele ocupate, colorate după stare, cu timpul de pregătire', async () => {
    renderWithProviders(routes, '/resources/15');

    await waitFor(() => expect(getResourceAvailability).toHaveBeenCalledWith(15, TODAY_RANGE));
    expect(await calendar().findByText('Așteaptă coordonatorul')).toBeInTheDocument();
    expect(calendar().getByText('10:00 - 12:00')).toBeInTheDocument();
    expect(calendar().getByText('Pregătire')).toBeInTheDocument();
    expect(screen.queryByText('Nicio rezervare în perioada afișată.')).not.toBeInTheDocument();
  });

  it('afișează săptămâna începând de azi, nu de luni', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/resources/15');
    const region = within(await screen.findByRole('region', { name: 'Calendarul resursei' }));
    await region.findByText('Așteaptă coordonatorul');

    await user.click(region.getByRole('button', { name: 'Săptămână' }));

    await waitFor(() =>
      expect(getResourceAvailability).toHaveBeenLastCalledWith(15, {
        from: TODAY.toISOString(),
        to: TODAY.add(7, 'day').toISOString(),
      }),
    );
  });

  it('anunță că nu există rezervări în perioada afișată', async () => {
    vi.mocked(getResourceAvailability).mockResolvedValue([]);
    renderWithProviders(routes, '/resources/15');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Nicio rezervare în perioada afișată.',
    );
    expect(calendar().queryByText('Pregătire')).not.toBeInTheDocument();
  });

  it.each([
    ['Mentenanta', 'Resursa este în mentenanță și nu poate fi rezervată până nu redevine activă.'],
    ['Defecta', 'Resursa este defectă și nu poate fi rezervată până nu redevine activă.'],
  ] as const)('nu are buton „Rezervă” pentru o resursă în starea %s', async (stare, message) => {
    vi.mocked(getResource).mockResolvedValue({ ...RESOURCE, stare });
    renderWithProviders(routes, '/resources/15');

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rezervă' })).not.toBeInTheDocument();
  });

  it('afișează un mesaj pentru o resursă inexistentă, fără să ceară disponibilitatea', async () => {
    vi.mocked(getResource).mockRejectedValue(
      httpError(404, { code: 'RESURSA_INEXISTENTA', message: 'Resursa cu id-ul 99 nu există.' }),
    );
    renderWithProviders(routes, '/resources/99');

    expect(await screen.findByText('Resursa nu există sau a fost ștearsă.')).toBeInTheDocument();
    expect(getResourceAvailability).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Catalog resurse' })).toHaveAttribute(
      'href',
      '/resources',
    );
  });

  it('nu cere resursa pentru un id invalid în URL', async () => {
    renderWithProviders(routes, '/resources/abc');

    expect(await screen.findByText('Resursa nu există sau a fost ștearsă.')).toBeInTheDocument();
    expect(getResource).not.toHaveBeenCalled();
  });

  it('afișează eroarea de încărcare și permite reîncercarea', async () => {
    vi.mocked(getResource).mockRejectedValueOnce(
      httpError(500, { code: 'EROARE_INTERNA', message: 'Eroare internă.' }),
    );
    const user = userEvent.setup();
    renderWithProviders(routes, '/resources/15');

    expect(await screen.findByRole('alert')).toHaveTextContent('Eroare internă.');
    await user.click(screen.getByRole('button', { name: 'Reîncearcă' }));
    expect(
      await screen.findByRole('heading', { name: 'Braț robotic UR5', level: 1 }),
    ).toBeInTheDocument();
  });
});
