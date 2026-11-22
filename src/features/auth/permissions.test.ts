import {
  ADMIN_USER,
  GRANT_COORDINATOR_USER,
  LAB_2_MANAGER_USER,
  TEST_USER,
} from '../../test/authenticatedUser';
import { canManageAnyLaboratory, canManageLaboratory, managedLaboratories } from './permissions';

describe('permissions', () => {
  it('Administratorul gestionează orice laborator', () => {
    expect(managedLaboratories(ADMIN_USER)).toBe('all');
    expect(canManageLaboratory(ADMIN_USER, 7)).toBe(true);
    expect(canManageAnyLaboratory(ADMIN_USER)).toBe(true);
  });

  it('Responsabilul gestionează doar laboratorul din scopul rolului', () => {
    expect(canManageLaboratory(LAB_2_MANAGER_USER, 2)).toBe(true);
    expect(canManageLaboratory(LAB_2_MANAGER_USER, 4)).toBe(false);
    expect(canManageLaboratory(LAB_2_MANAGER_USER, undefined)).toBe(false);
    expect(canManageAnyLaboratory(LAB_2_MANAGER_USER)).toBe(true);
  });

  it('Studentul și Coordonatorul de grant nu gestionează niciun laborator', () => {
    // Coordonatorul are scopId 2, dar pe un grant, nu pe laboratorul 2.
    for (const user of [TEST_USER, GRANT_COORDINATOR_USER, undefined]) {
      expect(canManageLaboratory(user, 2)).toBe(false);
      expect(canManageAnyLaboratory(user)).toBe(false);
    }
  });
});
