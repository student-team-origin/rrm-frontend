import type { CurrentUser } from './types';

/**
 * Laboratoarele ale căror resurse le poate modifica utilizatorul: `'all'` pentru Administratorul
 * de sistem, altfel id-urile din rolurile de Responsabil Laborator (scop `Laborator`). Aceleași
 * reguli ca în backend (TO-33), care rămâne sursa drepturilor.
 */
export function managedLaboratories(user: CurrentUser | undefined): 'all' | ReadonlySet<number> {
  const roles = user?.roluri ?? [];
  if (roles.some((role) => role.rol === 'AdministratorSistem')) {
    return 'all';
  }
  return new Set(
    roles.flatMap((role) =>
      role.rol === 'ResponsabilLaborator' && role.tipScop === 'Laborator' && role.scopId != null
        ? [role.scopId]
        : [],
    ),
  );
}

/** `true` dacă utilizatorul poate adăuga, edita, schimba starea sau șterge resursele laboratorului. */
export function canManageLaboratory(
  user: CurrentUser | undefined,
  laboratoryId: number | undefined,
): boolean {
  const managed = managedLaboratories(user);
  return managed === 'all' || (laboratoryId !== undefined && managed.has(laboratoryId));
}

/** `true` dacă utilizatorul gestionează cel puțin un laborator (deci poate adăuga resurse). */
export function canManageAnyLaboratory(user: CurrentUser | undefined): boolean {
  const managed = managedLaboratories(user);
  return managed === 'all' || managed.size > 0;
}
