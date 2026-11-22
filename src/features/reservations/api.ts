import { apiClient } from '../../api/client';
import type {
  CancelReservationInput,
  Grant,
  Reservation,
  ReservationDetail,
  ReservationInput,
  ReservationListParams,
  ReservationPage,
} from './types';

/** `GET /reservations`: rezervările utilizatorului curent, filtrate și paginate. */
export async function getMyReservations(params: ReservationListParams): Promise<ReservationPage> {
  const { data } = await apiClient.get<ReservationPage>('/reservations', { params });
  return data;
}

/** `GET /reservations/{id}`: detaliul unei rezervări, cu istoricul aprobărilor. */
export async function getReservation(id: number): Promise<ReservationDetail> {
  const { data } = await apiClient.get<ReservationDetail>(`/reservations/${id}`);
  return data;
}

/** `POST /reservations/{id}/cancel`: anulează rezervarea; intervalul se eliberează. */
export async function cancelReservation(
  id: number,
  input: CancelReservationInput,
): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>(`/reservations/${id}/cancel`, input);
  return data;
}

/**
 * `POST /reservations`: trimite o cerere de rezervare, care pornește în așteptarea coordonatorului.
 * Răspunde 409 dacă intervalul e ocupat și 422 dacă soldul grantului nu ajunge.
 */
export async function createReservation(input: ReservationInput): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>('/reservations', input);
  return data;
}

/** `GET /grants`: granturile din care face parte utilizatorul, cu orele rămase. */
export async function getGrants(): Promise<Grant[]> {
  const { data } = await apiClient.get<Grant[]>('/grants');
  return data;
}
