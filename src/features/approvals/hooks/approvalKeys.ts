import type { ApprovalTab } from '../types';

/** Cheile TanStack Query pentru lista de aprobări. */
export const approvalKeys = {
  all: ['approvals'] as const,
  list: (tab: ApprovalTab) => [...approvalKeys.all, 'list', tab] as const,
};
