import { useQuery } from '@tanstack/react-query';
import { getApprovals } from '../api';
import type { ApprovalTab } from '../types';
import { approvalKeys } from './approvalKeys';

/** Cererile din tab-ul dat: în așteptare (decizia utilizatorului) sau deja aprobate / respinse. */
export function useApprovals(tab: ApprovalTab) {
  return useQuery({
    queryKey: approvalKeys.list(tab),
    queryFn: () => getApprovals(tab),
  });
}
