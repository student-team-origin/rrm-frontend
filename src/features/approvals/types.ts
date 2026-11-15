import type { components, operations } from '../../api/schema';

/** O cerere de rezervare din lista de aprobări (schema `RezervareDetaliu`). */
export type ApprovalRequest = components['schemas']['RezervareDetaliu'];

/** Tab-ul listei: `inAsteptare`, `aprobate` sau `respinse` (parametrul `stare`). */
export type ApprovalTab = NonNullable<
  NonNullable<operations['getApprovals']['parameters']['query']>['stare']
>;

/** Corpul deciziei: observația (opțională la aprobare, obligatorie la respingere). */
export type DecisionInput = components['schemas']['DecizieRequest'];

/** Decizia înregistrată (schema `Aprobare`). */
export type Decision = components['schemas']['Aprobare'];

/** Ce face aprobatorul: aprobă sau respinge. */
export type DecisionKind = 'approve' | 'reject';
