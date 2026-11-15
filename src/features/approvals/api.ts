import { apiClient } from '../../api/client';
import type { ApprovalRequest, ApprovalTab, Decision, DecisionInput } from './types';

/** `GET /approvals`: cererile care așteaptă decizia utilizatorului sau cele deja decise de el. */
export async function getApprovals(stare: ApprovalTab): Promise<ApprovalRequest[]> {
  const { data } = await apiClient.get<ApprovalRequest[]>('/approvals', { params: { stare } });
  return data;
}

/** `POST /approvals/{id}/approve`: aprobă cererea la nivelul ei curent. */
export async function approveRequest(id: number, input: DecisionInput): Promise<Decision> {
  const { data } = await apiClient.post<Decision>(`/approvals/${id}/approve`, input);
  return data;
}

/** `POST /approvals/{id}/reject`: respinge cererea; motivul este obligatoriu. */
export async function rejectRequest(id: number, input: DecisionInput): Promise<Decision> {
  const { data } = await apiClient.post<Decision>(`/approvals/${id}/reject`, input);
  return data;
}
