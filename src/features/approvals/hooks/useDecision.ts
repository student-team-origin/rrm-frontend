import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationKeys } from '../../reservations/hooks/reservationKeys';
import { resourceKeys } from '../../resources/hooks/resourceKeys';
import { approveRequest, rejectRequest } from '../api';
import type { ApprovalRequest, DecisionInput, DecisionKind } from '../types';
import { isStaleListError } from '../utils/approvalRules';
import { approvalKeys } from './approvalKeys';

type DecisionVariables = { request: ApprovalRequest; kind: DecisionKind; input: DecisionInput };

/**
 * Aprobă sau respinge o cerere. După succes reîncarcă toate tab-urile de aprobări, rezervările și
 * calendarul resursei (la respingere intervalul se eliberează). Dacă cererea a fost decisă sau a
 * început între timp (404, 409), reîncarcă lista, ca ea să nu mai apară în „În așteptare”.
 */
export function useDecision() {
  const queryClient = useQueryClient();
  const refresh = async (request: ApprovalRequest) => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: approvalKeys.all }),
      queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
    ];
    if (request.resursaId !== undefined) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: resourceKeys.availability(request.resursaId) }),
      );
    }
    await Promise.all(invalidations);
  };

  return useMutation({
    mutationFn: ({ request, kind, input }: DecisionVariables) => {
      const id = request.id as number;
      return kind === 'approve' ? approveRequest(id, input) : rejectRequest(id, input);
    },
    onSuccess: (_decision, { request }) => refresh(request),
    onError: (error, { request }) => (isStaleListError(error) ? refresh(request) : undefined),
  });
}
