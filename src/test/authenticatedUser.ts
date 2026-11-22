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

/** Administratorul de sistem: gestionează resursele tuturor laboratoarelor. */
export const ADMIN_USER: CurrentUser = {
  id: 1,
  nume: 'Admin Sistem',
  email: 'admin@usv.ro',
  activ: true,
  doiFactoriActiv: false,
  roluri: [{ rol: 'AdministratorSistem', tipScop: 'Global', scopId: null }],
};

/** Responsabilul Laboratorului 2: gestionează doar resursele acelui laborator. */
export const LAB_2_MANAGER_USER: CurrentUser = {
  id: 4,
  nume: 'Mihai Ionescu',
  email: 'mihai.ionescu@usv.ro',
  activ: true,
  doiFactoriActiv: false,
  roluri: [{ rol: 'ResponsabilLaborator', tipScop: 'Laborator', scopId: 2 }],
};

/** Coordonatorul unui grant: nu gestionează niciun laborator. */
export const GRANT_COORDINATOR_USER: CurrentUser = {
  id: 3,
  nume: 'Elena Marin',
  email: 'elena.marin@usv.ro',
  activ: true,
  doiFactoriActiv: false,
  roluri: [{ rol: 'CoordonatorGrant', tipScop: 'Grant', scopId: 2 }],
};
