import { apiClient } from '../../api/client';
import type { Laboratory, ResourceCategory, ResourceListParams, ResourcePage } from './types';

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
