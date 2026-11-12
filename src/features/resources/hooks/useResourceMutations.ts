import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeResourceStatus, createResource, deleteResource, updateResource } from '../api';
import type { ResourceInput, ResourceStatusChange } from '../types';
import { resourceKeys } from './resourceKeys';

/** Reîncarcă tot ce ține de catalog după o modificare reușită. */
function useInvalidateResources() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: resourceKeys.all });
}

/** Adaugă o resursă (`POST /resources`) și reîncarcă lista. */
export function useCreateResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (input: ResourceInput) => createResource(input),
    onSuccess: invalidate,
  });
}

/** Actualizează o resursă (`PUT /resources/{id}`) și reîncarcă lista. */
export function useUpdateResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ResourceInput }) => updateResource(id, input),
    onSuccess: invalidate,
  });
}

/** Șterge o resursă (`DELETE /resources/{id}`) și reîncarcă lista. */
export function useDeleteResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: invalidate,
  });
}

/** Schimbă starea unei resurse (`PATCH /resources/{id}/status`) și reîncarcă lista. */
export function useChangeResourceStatus() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ id, change }: { id: number; change: ResourceStatusChange }) =>
      changeResourceStatus(id, change),
    onSuccess: invalidate,
  });
}
