import { apiClient } from '../../api/client';
import type { CurrentUser, LoginRequest, LoginResponse } from './types';

/** `POST /auth/login`: verifică e-mailul și parola; întoarce tokenul sau o provocare 2FA. */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', request);
  return data;
}

/** `GET /auth/me`: utilizatorul autentificat, cu rolurile sale. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/auth/me');
  return data;
}

/** `POST /auth/logout`: închide sesiunea pe server; tokenul nu mai este acceptat. */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
