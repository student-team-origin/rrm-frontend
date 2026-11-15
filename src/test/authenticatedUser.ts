import type { CurrentUser } from '../features/auth/types';

/** Utilizatorul cu care rulează implicit testele (vezi `setup.ts`). */
export const TEST_USER: CurrentUser = {
  id: 6,
  nume: 'Andrei Popescu',
  email: 'andrei.popescu@student.usv.ro',
  activ: true,
  doiFactoriActiv: false,
  roluri: [{ rol: 'Student', tipScop: 'Global', scopId: null }],
};

/** Tokenul pus în sessionStorage pentru utilizatorul de test. */
export const TEST_TOKEN = 'token-de-test';
