import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { httpError } from '../../../api/testUtils';
import { routes } from '../../../routes/routes';
import { TEST_USER } from '../../../test/authenticatedUser';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { getCurrentUser } from '../../auth/api';
import type { CurrentUser } from '../../auth/types';
import { approveRequest, getApprovals, rejectRequest } from '../api';
import type { ApprovalRequest } from '../types';

vi.mock('../api');

const COORDINATOR: CurrentUser = {
  id: 5,
  nume: 'Conf. dr. Elena Marin',
  email: 'elena.marin@usv.ro',
  activ: true,
  doiFactoriActiv: false,
  roluri: [{ rol: 'CoordonatorGrant', tipScop: 'Grant', scopId: 2 }],
};

const START = dayjs().add(2, 'day').hour(9).minute(0).second(0).millisecond(0);

const PENDING: ApprovalRequest = {
  id: 4,
  resursaId: 4,
  grantId: 2,
  solicitantId: 8,
  stare: 'InAsteptareCoordonator',
  start: START.toISOString(),
  sfarsit: START.add(90, 'minute').toISOString(),
  oreSolicitate: 1.5,
  scop: 'Măsurători pe placa de achiziție DigiLab',
  resursa: { id: 4, denumire: 'Osciloscop Rigol DS1054' },
  solicitant: { id: 8, nume: 'Ștefan Rusu' },
  aprobari: [],
};

function card(): HTMLElement {
  return screen.getByRole('article', { name: /^Cerere Osciloscop Rigol DS1054/ });
}

describe('ApprovalsPage', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(COORDINATOR);
    vi.mocked(getApprovals).mockResolvedValue([PENDING]);
  });

  it('afișează cererile în așteptare, cu nivelul și butoanele de decizie', async () => {
    renderWithProviders(routes, '/approvals');

    expect(await screen.findByRole('heading', { name: 'Aprobări', level: 1 })).toBeInTheDocument();
    const request = within(await screen.findByRole('article'));
    expect(request.getByText('Osciloscop Rigol DS1054')).toBeInTheDocument();
    expect(request.getByText(/Ștefan Rusu/)).toBeInTheDocument();
    expect(request.getByText('Nivelul 1 · Coordonator grant')).toBeInTheDocument();
    expect(request.getByText('Coordonator grant: În așteptare')).toBeInTheDocument();
    expect(request.getByRole('button', { name: /^Aprobă cererea/ })).toBeInTheDocument();
    expect(request.getByRole('button', { name: /^Respinge cererea/ })).toBeInTheDocument();
    expect(getApprovals).toHaveBeenCalledWith('inAsteptare');
  });

  it('după aprobare, cererea dispare din „În așteptare”', async () => {
    vi.mocked(approveRequest).mockResolvedValue({
      id: 50,
      rezervareId: 4,
      nivel: 1,
      decizie: 'Aprobat',
    });
    const user = userEvent.setup();
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    await user.click(within(card()).getByRole('button', { name: /^Aprobă cererea/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Aprobă cererea' });
    vi.mocked(getApprovals).mockResolvedValue([]);
    await user.click(within(dialog).getByRole('button', { name: 'Aprobă' }));

    expect(
      await screen.findByText('Cererea a fost aprobată și trimisă responsabilului de laborator.'),
    ).toBeInTheDocument();
    expect(approveRequest).toHaveBeenCalledWith(4, {});
    expect(await screen.findByText('Nicio cerere nu așteaptă decizia ta.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('cere motivul la respingere și îl trimite', async () => {
    vi.mocked(rejectRequest).mockResolvedValue({
      id: 51,
      rezervareId: 4,
      nivel: 1,
      decizie: 'Respins',
    });
    const user = userEvent.setup();
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    await user.click(within(card()).getByRole('button', { name: /^Respinge cererea/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Respinge cererea' });
    await user.click(within(dialog).getByRole('button', { name: 'Respinge' }));
    expect(
      await within(dialog).findByText('Motivul respingerii este obligatoriu.'),
    ).toBeInTheDocument();
    expect(rejectRequest).not.toHaveBeenCalled();

    await user.type(
      within(dialog).getByRole('textbox', { name: /Motivul respingerii/ }),
      'Nu ține de grant',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Respinge' }));

    expect(
      await screen.findByText('Cererea a fost respinsă. Intervalul a fost eliberat.'),
    ).toBeInTheDocument();
    expect(rejectRequest).toHaveBeenCalledWith(4, { observatie: 'Nu ține de grant' });
  });

  it('afișează motivul backend-ului și reîncarcă lista când cererea nu mai așteaptă', async () => {
    vi.mocked(approveRequest).mockRejectedValue(
      httpError(409, {
        code: 'REZERVARE_INCEPUTA',
        message: 'Rezervarea a început deja; nu se mai poate decide asupra ei.',
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    await user.click(within(card()).getByRole('button', { name: /^Aprobă cererea/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Aprobă cererea' });
    await user.click(within(dialog).getByRole('button', { name: 'Aprobă' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Rezervarea a început deja; nu se mai poate decide asupra ei.',
    );
    await waitFor(() => expect(getApprovals).toHaveBeenCalledTimes(2));
  });

  it('nu oferă Aprobă / Respinge pentru propria cerere a aprobatorului', async () => {
    vi.mocked(getApprovals).mockResolvedValue([{ ...PENDING, solicitantId: COORDINATOR.id }]);
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    expect(
      within(card()).getByText('Este cererea ta: o decide un alt aprobator.'),
    ).toBeInTheDocument();
    expect(
      within(card()).queryByRole('button', { name: /^Aprobă cererea/ }),
    ).not.toBeInTheDocument();
    expect(
      within(card()).queryByRole('button', { name: /^Respinge cererea/ }),
    ).not.toBeInTheDocument();
  });

  it('arată cererile respinse fără butoane de decizie', async () => {
    const rejected: ApprovalRequest = {
      ...PENDING,
      stare: 'Respinsa',
      aprobari: [{ id: 6, nivel: 1, decizie: 'Respins', observatie: 'Nu ține de grant.' }],
    };
    vi.mocked(getApprovals).mockImplementation((tab) =>
      Promise.resolve(tab === 'respinse' ? [rejected] : [PENDING]),
    );
    const user = userEvent.setup();
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    await user.click(screen.getByRole('tab', { name: 'Respinse' }));

    expect(await screen.findByText('Nu ține de grant.')).toBeInTheDocument();
    expect(getApprovals).toHaveBeenLastCalledWith('respinse');
    expect(
      within(card()).queryByRole('button', { name: /^Aprobă cererea/ }),
    ).not.toBeInTheDocument();
  });

  it('nu lasă un student pe pagina Aprobări și nu îi arată intrarea din meniu', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(TEST_USER);
    renderWithProviders(routes, '/approvals');

    expect(await screen.findByText('Nu ai acces la această pagină.')).toBeInTheDocument();
    expect(getApprovals).not.toHaveBeenCalled();
  });

  it('arată „Aprobări” în meniu doar aprobatorilor', async () => {
    const user = userEvent.setup();
    renderWithProviders(routes, '/approvals');
    await screen.findByRole('article');

    await user.click(screen.getByRole('button', { name: 'Deschide meniul' }));
    expect(await screen.findByRole('link', { name: 'Aprobări' })).toBeInTheDocument();
  });
});
