import { apiClient } from '../../api/client';
import type {
  Laboratory,
  Resource,
  ResourceCategory,
  ResourceInput,
  ResourceListParams,
  ResourcePage,
  ResourceStatusChange,
  ResourceStatusChangeResult,
} from './types';

/** `GET /resources`: o pagină din catalog, filtrată după parametrii dați. */
export async function getResources(params: ResourceListParams): Promise<ResourcePage> {
  const { data } = await apiClient.get<ResourcePage>('/resources', { params });
  return data;
}

/** `GET /labs`: toate laboratoarele. */
export async function getLabs(): Promise<Laboratory[]> {
  const { data } = await apiClient.get<Laboratory[]>('/labs');
  return data;
}

/** `GET /resource-categories`: toate categoriile de resurse. */
export async function getResourceCategories(): Promise<ResourceCategory[]> {
  const { data } = await apiClient.get<ResourceCategory[]>('/resource-categories');
  return data;
}

/** `POST /resources`: adaugă o resursă nouă. */
export async function createResource(input: ResourceInput): Promise<Resource> {
  const { data } = await apiClient.post<Resource>('/resources', input);
  return data;
}

/** `PUT /resources/{id}`: actualizează toate câmpurile editabile ale unei resurse. */
export async function updateResource(id: number, input: ResourceInput): Promise<Resource> {
  const { data } = await apiClient.put<Resource>(`/resources/${id}`, input);
  return data;
}

/** `DELETE /resources/{id}`: șterge o resursă (backend-ul răspunde 409 dacă are rezervări). */
export async function deleteResource(id: number): Promise<void> {
  await apiClient.delete(`/resources/${id}`);
}

/** `PATCH /resources/{id}/status`: schimbă starea unei resurse. */
export async function changeResourceStatus(
  id: number,
  change: ResourceStatusChange,
): Promise<ResourceStatusChangeResult> {
  const { data } = await apiClient.patch<ResourceStatusChangeResult>(
    `/resources/${id}/status`,
    change,
  );
  return data;
}
